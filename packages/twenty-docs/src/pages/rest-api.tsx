import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useEffect, useState } from "react";
import { API } from '@stoplight/elements';
import spotlightTheme from '!css-loader!@stoplight/elements/styles.min.css';
import './rest-api.css'
import { parseJson } from "nx/src/utils/json";
import { TbLoader2 } from "react-icons/tb";

type TokenFormProps = {
  onSubmit: (token: string) => void,
  isTokenValid: boolean,
  isLoading: boolean,
  token: string,
}

const TokenForm = ({onSubmit, isTokenValid, token, isLoading}: TokenFormProps)=> {
  const updateToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('TryIt_securitySchemeValues', JSON.stringify({bearerAuth: event.target.value}))
    onSubmit(event.target.value)
  }

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = spotlightTheme.toString();
    document.head.append(styleElement);

    return () => styleElement.remove();
  }, []);

  return !isTokenValid && (
    <div>
      <div className='container'>
      <form className="form">
        <label>
          To load your REST API schema, <a className='link' href='https://app.twenty.com/settings/developers/api-keys'>generate an API key</a> and paste it here:
        </label>
        <p>
          <input
            className={(token && !isLoading) ? "input invalid" : "input"}
            type='text'
            disabled={isLoading}
            placeholder='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMD...'
            defaultValue={token}
            onChange={updateToken}
          />
          <p className={`token-invalid ${(!token || isLoading )&& 'not-visible'}`}>Token invalid</p>
          <div className='loader-container'>
            <TbLoader2 className={`loader ${!isLoading && 'not-visible'}`} />
          </div>
        </p>
      </form>
      </div>
    </div>
    )
}

const RestApiComponent = () => {
  const [openApiJson, setOpenApiJson] = useState({})
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const storedToken = parseJson(localStorage.getItem('TryIt_securitySchemeValues'))?.bearerAuth ?? ''

  const validateToken = (openApiJson) => setIsTokenValid(!!openApiJson.tags)

  const getJson = async (token: string ) => {
    setIsLoading(true)
    return await fetch(
      "https://api.twenty.com/open-api",
      {headers: {Authorization: `Bearer ${token}`}}
    )
      .then((res)=> res.json())
      .then((result)=> {
        validateToken(result)
        setIsLoading(false)
        return result
      })
      .catch(() => setIsLoading(false))
  }

  const submitToken = async (token) => {
    if (isLoading) return
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
      <TokenForm
        onSubmit={submitToken}
        isTokenValid={isTokenValid}
        isLoading={isLoading}
        token={storedToken}
      />
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
