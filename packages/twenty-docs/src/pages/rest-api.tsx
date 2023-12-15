import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useEffect, useState } from "react";
import { API } from '@stoplight/elements';
import '@stoplight/elements/styles.min.css';
import './graphql.css'
import { parseJson } from "nx/src/utils/json";

interface TokenFormPropsI {
  onSubmit: (token: string) => void,
  isTokenValid: boolean | undefined,
  token: string,
}

const TokenForm = ({onSubmit, isTokenValid, token}: TokenFormPropsI)=> {
  const updateToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSubmit(event.target.value)
    localStorage.setItem('TryIt_securitySchemeValues', JSON.stringify({bearerAuth: event.target.value}))
  }

  return !isTokenValid && (
    <div>
      <form className="form">
        <label>
          To load all your API endpoints, <a className='link' href='https://app.twenty.com/settings/developers/api-keys'>generate an API key</a> and paste it here:
        </label>
        <input
          className={token ? "input invalid" : "input"}
          type='text'
          placeholder='123'
          value={token}
          onChange={updateToken}
        />
        {token && <span style={{ color: 'red', fontSize: '12px' }}>Token invalid</span>}
      </form>
    </div>
    )
}

const RestApiComponent = () => {
  const [openApiJson, setOpenApiJson] = useState({})
  const [isTokenValid, setIsTokenValid] = useState<TokenFormPropsI['isTokenValid']>(undefined)
  const storedToken = parseJson(localStorage.getItem('TryIt_securitySchemeValues'))?.bearerAuth ?? ''

  const validateToken = (openApiJson) => {
    if(openApiJson.tags) {
      setIsTokenValid(true)
    } else {
      setIsTokenValid(false)
    }
  }

  const getJson = async (token: string ) => {
    return await fetch(
      "http://localhost:3000/open-api",
      {headers: {Authorization: `Bearer ${token}`}}
    ).then((res)=> res.json()).then((result)=> {
      validateToken(result)
      return result
    })
  }

  const submitToken = async (token) => {
    const json = await getJson(token)
    setOpenApiJson(json)
  }

  useEffect(()=> {
     (async ()=> {
       await submitToken(storedToken)
    })()
  },[])

  return isTokenValid !== undefined && (
    <>
      <TokenForm onSubmit={submitToken} isTokenValid={isTokenValid} token={storedToken} />
      {
        isTokenValid && (
        <API
          apiDescriptionDocument={JSON.stringify(openApiJson)}
          router="hash"
        />
        )
      }
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
