import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({ uri: process.env.REACT_APP_API_URL });

const authLink = setContext((_, { headers }) => {
  const requestHeaders = { ...headers };
  const token = localStorage.getItem('accessToken');
  const headerContainsPublicRole =
    requestHeaders.hasOwnProperty('x-hasura-default-role') &&
    requestHeaders['x-hasura-default-role'] === 'public';
  if (!headerContainsPublicRole && token) {
    requestHeaders['authorization'] = `Bearer ${token}`;
  }

  return {
    headers: requestHeaders,
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
);
