import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useEffect, useState } from "react";
import { API } from '@stoplight/elements';
import '@stoplight/elements/styles.min.css';

const RestApiComponent = () => {
  const [token, setToken] = useState('')
  const [openApiJson, setOpenApiJson] = useState({})
  const updateToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value)
  }
  const submitToken = async (e) => {
    e.preventDefault();
    const json = await fetch(
      "http://localhost:3000/open-api",
      {headers: {Authorization: `Bearer ${token}`}}
    ).then((res)=> res.json())
    setOpenApiJson(json)
  }
  useEffect(()=> {
     (async ()=> {
      const initialJson = await fetch(
        "http://localhost:3000/open-api",
      ).then((res)=> res.json())
     setOpenApiJson(initialJson)
    })()
  },[])
  return (
    <div className="App">
      <div>
        <form>
          <input type='text' value={token} onChange={updateToken}/>
          <button type='submit' onClick={submitToken}>Load Schema</button>
        </form>
      </div>
      <API
        apiDescriptionDocument={JSON.stringify(openApiJson)}
        router="hash"
      />
    </div>
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
