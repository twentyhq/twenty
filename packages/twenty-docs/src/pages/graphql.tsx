import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useTheme, Theme } from "@graphiql/react";
import Playground from "../components/playground";
import "graphiql/graphiql.css";


// Docusaurus does SSR for custom pages, but we need to load GraphiQL in the browser
const GraphQlComponent = ({token}) => {
  const fetcher = createGraphiQLFetcher({ url: "https://api.twenty.com/graphql" });

  return (
    <div className="fullHeightPlayground">
      <GraphiQL
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({Authorization: `Bearer ${token}`})}
      />
    </div>
  )
}

const graphQL = () => {
  const [token , setToken] = useState()
  const { setTheme } = useTheme();

  useEffect(()=> {
    window.localStorage.setItem("graphiql:theme", window.localStorage.getItem("theme") || 'light');

    const handleThemeChange = (ev) => {
      if(ev.key === 'theme') {
        setTheme(ev.newValue as Theme);
      }
    }

    window.addEventListener('storage', handleThemeChange)

    return () => window.removeEventListener('storage', handleThemeChange)
  }, [])

  const children = <GraphQlComponent token={token} />

  return (
    <Layout
      title="GraphQL Playground"
      description="GraphQL Playground for Twenty"
    >
        <BrowserOnly>{
          () => <Playground
            children={children}
            setToken={setToken}
          />
        }</BrowserOnly>
    </Layout>
  )
};

export default graphQL;
