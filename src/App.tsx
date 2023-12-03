/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef, FormEvent } from "react";
import { FiTrash, FiEdit, FiEye, FiEyeOff } from "react-icons/fi";

import { api } from "./services/api";

interface CustomerProps {
	id: string;
	nome: string;
	email: string;
	password: string;
}

export default function App() {
	const [customers, setCustomers] = useState<CustomerProps[]>([]);
	const [passwordVisible, setPasswordVisible] = useState(true);
	const [alterar, setAlterar] = useState(false);
	const codigoRef = useRef<HTMLInputElement | null>(null);
	const nameRef = useRef<HTMLInputElement | null>(null);
	const emailRef = useRef<HTMLInputElement | null>(null);
	const passwordRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		loadCustomers();
	}, [customers]);

	async function loadCustomers() {
		const response = await api.get("/customers");
		setCustomers(response.data);
	}

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};
	const toggleAlterar = () => {
		setAlterar(!alterar);
	};

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const codigo = codigoRef.current?.value;
		const name = nameRef.current?.value;
		const email = emailRef.current?.value;
		const password = passwordRef.current?.value;

		if (!name || !email) {
			return;
		}
		const data = {
			id: codigo,
			nome: name,
			email: email,
			password: password,
		};
		if (!alterar) {
			const response = await api.post("/customer", data);
			setCustomers([...customers, response.data]);
			handleReset();
		} else {
			onUpdate();
			handleReset();
			toggleAlterar();
		}

		handleReset();
	}

	async function onUpdate() {
		const codigo = codigoRef.current?.value.trim();
		const name = nameRef.current?.value;
		const email = emailRef.current?.value;
		const password = passwordRef.current?.value;

		const data = {
			id: codigo,
			nome: name,
			email: email,
			password: password,
		};

		try {
			await api.put("/customer", data);
		} catch (error) {
			console.log(error);
		}
	}

	async function handleDelete(id: string) {
		try {
			await api.delete("/customer", {
				params: {
					id: id,
				},
			});
			const filteredCustomers = customers.filter(
				(customer) => customer.id !== id
			);
			setCustomers(filteredCustomers);
		} catch (error) {
			console.log(error);
		}
	}

	const handleReset = () => {
		Array.from(document.querySelectorAll("input")).forEach(
			(input) => (input.value = "")
		);
	};

	async function handleLoadData(id: string) {
		const updateData = await api.get("/customer/:id", {
			params: {
				id: id.trim(),
			},
		});
		codigoRef.current!.value = updateData.data.id;
		nameRef.current!.value = updateData.data.nome;
		emailRef.current!.value = updateData.data.email;
		passwordRef.current!.value = updateData.data.password;
		toggleAlterar();
	}

	return (
		<div className='flex w-full min-h-screen bg-gray-900 px-2 '>
			<div className='flex w-full justify-center min-h-screen px-4'>
				<main className='w-full my-10 rounded-md md:max-w-2xl'>
					<h1 className='text-4xl font-medium text-white'>Clientes</h1>
					<form onSubmit={handleSubmit} className='mt-10 my-6 flex flex-col'>
						<label htmlFor='codigo' className='text-white mb-1'>
							Código:
						</label>
						<input
							type='text'
							id='codigo'
							ref={codigoRef}
							disabled={alterar}
							className='p-2 rounded-md bg-gray-800 text-white'
							placeholder='Digite o código do cliente'
						/>
						<label htmlFor='nome' className='text-white mb-1'>
							Nome:
						</label>
						<input
							type='text'
							id='nome'
							name='nome'
							ref={nameRef}
							className='p-2 rounded-md bg-gray-800 text-white'
							placeholder='Digite o nome do cliente'
						/>
						<label htmlFor='email' className='text-white mb-1'>
							Email:
						</label>
						<input
							type='email'
							id='email'
							ref={emailRef}
							className='p-2 rounded-md bg-gray-800 text-white'
							placeholder='Digite o email do cliente'
						/>
						<label htmlFor='password' className='text-white mb-1'>
							Senha:
						</label>
						<div className='flex w-full items-center relative'>
							<input
								type={passwordVisible ? "password" : "text"}
								id='password'
								min={6}
								max={12}
								ref={passwordRef}
								className='w-full p-2 rounded-md bg-gray-800 text-white'
							/>
							<button
								type='button'
								onClick={togglePasswordVisibility}
								className='text-white mb-1 absolute top-3 right-1'>
								{passwordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
							</button>
						</div>
						<input
							type='submit'
							value={alterar ? "Alterar" : "Cadastrar"}
							className={`mt-5 p-2 rounded-md font-medium bg-green-500 text-white 
									cursor-pointer hover:bg-green-960 
									transition-all duration-200`}
						/>
					</form>
					<section className='flex flex-col gap-4'>
						{customers.map((cliente) => (
							<article
								key={cliente.id}
								className={`w-full bg-gray-800 
										rounded-md p-4 text-white 
										font-medium relative cursor-pointer 
										hover:scale-105 duration-200 hover:bg-slate-960`}>
								<p className='flex w-full'>
									<span className='flex w-20'>Código:</span>
									<span className='flex w-96'>{cliente.id}</span>
								</p>
								<p className='flex w-full'>
									<span className='flex w-20'>Nome:</span>
									<span className='flex w-96'>{cliente.nome}</span>
								</p>
								<p className='flex w-full'>
									<span className='flex w-20'>Email:</span>
									<span className='flex w-96'>{cliente.email}</span>
								</p>
								<p className='flex w-full'>
									<span className='flex w-20'>Senha:</span>
									<span className='flex w-96'>{cliente.password}</span>
								</p>

								<button
									onClick={() => handleLoadData(cliente.id.toString().trim())}
									className={`flex bg-blue-500 w-7 h-7 
											rounded-sm justify-center items-center 
											absolute right-10 -top-2 `}>
									<FiEdit size={20} color='#FFF' />
								</button>
								<button
									onClick={() => handleDelete(cliente.id.toString())}
									className={`flex bg-red-500 w-7 h-7 
											rounded-sm justify-center items-center 
											absolute right-0 -top-2`}>
									<FiTrash size={20} color='#FFF' />
								</button>
							</article>
						))}
					</section>
				</main>
			</div>
		</div>
	);
}
