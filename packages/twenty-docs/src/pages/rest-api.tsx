import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useEffect, useState } from "react";
import { API } from '@stoplight/elements';
import '@stoplight/elements/styles.min.css';
import './graphql.css'

interface TokenFormPropsI {
  onSubmit: (token: string) => void
}

const TokenForm = ({onSubmit}: TokenFormPropsI)=> {
  const updateToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    onSubmit(event.target.value)
  }

  return (
    <div>
      <form className="form">
        <label>
          To load all your API endpoints, <a className='link' href='https://app.twenty.com/settings/developers/api-keys'>generate an API key</a> and paste it here:
        </label>
        <input
          className="input"
          type='text'
          placeholder='123'
          onChange={updateToken}
        />
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

  const submitToken = async (token) => {
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
