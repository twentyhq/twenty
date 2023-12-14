import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useEffect, useState } from "react";
import { API } from '@stoplight/elements';
import '@stoplight/elements/styles.min.css';

interface TokenFormPropsI {
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>, token: string) => void
}

const TokenForm = ({onSubmit}: TokenFormPropsI)=> {
  const [token, setToken] = useState('')
  const updateToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value)
  }

  return (
    <div>
      <form>
        <input type='text' value={token} onChange={updateToken}/>
        <button type='submit' onClick={(event) => onSubmit(event, token)}>Load Schema</button>
      </form>
    </div>
    )
}

const RestApiComponent = () => {
  const [openApiJson, setOpenApiJson] = useState({})

  const getJson = async (token: string ) => {
    return await fetch(
      "http://localhost:3000/open-api",
      {headers: {Authorization: `Bearer ${token}`}}
    ).then((res)=> res.json())
  }

  const submitToken = async (event, token) => {
    event.preventDefault()

    const json = await getJson(token)

    setOpenApiJson(json)
  }
  useEffect(()=> {
     (async ()=> {
       const initialJson = await getJson('')

       setOpenApiJson(initialJson)
    })()
  },[])

  return (
    <>
      <TokenForm onSubmit={submitToken} />
      <API
        apiDescriptionDocument={JSON.stringify(openApiJson)}
        router="hash"
      />
    </>
  )
}

const restApi = () => (
  <Layout
    title="REST API Playground"
    description="REST API Playground for Twenty"
  >
    <BrowserOnly>{() => <RestApiComponent />}</BrowserOnly>
  </Layout>
);

export default restApi;
