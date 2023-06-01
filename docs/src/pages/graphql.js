import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

import 'graphiql/graphiql.css';


// Docusaurus does SSR for custom pages but we need to load GraphiQL in the browser
function GraphiQLComponent() {
  const fetcher = createGraphiQLFetcher({ url: 'https://api.twenty.com/graphql' });
  return <GraphiQL fetcher={fetcher} />;
}

export default function graphQL() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div className="fullHeightPlayground">
        <BrowserOnly>
          {() => <GraphiQLComponent />}
        </BrowserOnly>
      </div>
    </Layout>
  );
}