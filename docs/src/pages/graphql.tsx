import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

import 'graphiql/graphiql.css';


// Docusaurus does SSR for custom pages but we need to load GraphiQL in the browser
function GraphiQLComponent() {
  if(!window.localStorage.getItem('graphiql:theme') && window.localStorage.getItem('theme') != 'dark') {
    window.localStorage.setItem('graphiql:theme', 'light');
  } 

  const fetcher = createGraphiQLFetcher({ url: 'https://api.twenty.com/graphql' });
  return (
  <div className="fullHeightPlayground">
    <GraphiQL fetcher={fetcher} />;
  </div>
  );
}

export default function graphQL() {
  return (
    <Layout title="GraphQL Playground" description="GraphQL Playground for Twenty">
      
        <BrowserOnly>
          {() => <GraphiQLComponent />}
        </BrowserOnly>
    </Layout>
  );
}