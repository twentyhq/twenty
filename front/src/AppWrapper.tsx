import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { isMockModeState } from '@/auth/states/isMockModeState';

import { apolloClient, mockClient } from './infrastructure/apollo';
import { AppThemeProvider } from './providers/AppThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { App } from './App';

export function AppWrapper() {
  const [isMockMode] = useRecoilState(isMockModeState);
  return (
    <ApolloProvider client={isMockMode ? mockClient : apolloClient}>
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
  );
}
