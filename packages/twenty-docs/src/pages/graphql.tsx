import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import React, { useState } from "react";
import "graphiql/graphiql.css";
import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Playground from "../components/playground";


const graphQL = () => {
  const [token , setToken] = useState()

  const fetcher = createGraphiQLFetcher({
    url: "https://api.twenty.com/graphql",
    headers: {Authorization: `Bearer ${token}`},
  });

  const children = (
    <div className="fullHeightPlayground">
      <GraphiQL fetcher={fetcher} />;
    </div>
  )

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
