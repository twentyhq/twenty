import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { RecoilRoot } from 'recoil';

import '@emotion/react';

import { ThemeType } from './modules/ui/layout/styles/themes';
import { AppThemeProvider } from './providers/AppThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { apiClient } from './apollo';
import { App } from './App';

import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <RecoilRoot>
    <ApolloProvider client={apiClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppThemeProvider>
            <StrictMode>
              <App />
            </StrictMode>
          </AppThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </RecoilRoot>,
);

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}
