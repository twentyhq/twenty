import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import '@emotion/react';
import { ThemeType } from './layout/styles/themes';
import { apiClient } from './apollo';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <ApolloProvider client={apiClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
);

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}
