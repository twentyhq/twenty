import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from './providers/apollo/ApolloProvider';
import { AuthProvider } from './providers/auth/AuthProvider';
import { AppThemeProvider } from './providers/theme/AppThemeProvider';
import { App } from './App';

export function AppWrapper() {
  return (
    <ApolloProvider>
      <BrowserRouter>
        {/* <AuthProvider> */}
        <AppThemeProvider>
          <StrictMode>
            <App />
          </StrictMode>
        </AppThemeProvider>
        {/* </AuthProvider> */}
      </BrowserRouter>
    </ApolloProvider>
  );
}
