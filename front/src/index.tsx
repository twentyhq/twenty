import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import '@emotion/react';
import { apiClient } from './apollo';
import { RecoilRoot } from 'recoil';
import { darkTheme, lightTheme, ThemeType } from './layout/styles/themes';
import { ThemeProvider } from '@emotion/react';

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
const defaultTheme = isDarkMode ? darkTheme : lightTheme;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <RecoilRoot>
    <ApolloProvider client={apiClient}>
      <BrowserRouter>
        <StrictMode>
          <ThemeProvider theme={defaultTheme}>
            <App />
          </ThemeProvider>
        </StrictMode>
      </BrowserRouter>
    </ApolloProvider>
  </RecoilRoot>,
);

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}
