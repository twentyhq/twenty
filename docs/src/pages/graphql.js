import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@theme/Layout';

import 'graphiql/graphiql.css';

const fetcher = createGraphiQLFetcher({ url: 'https://api.twenty.com/graphql' });

export default function graphQL() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div class="fullHeightPlayground">
        <GraphiQL fetcher={fetcher} />
      </div>
    </Layout>
  );
}