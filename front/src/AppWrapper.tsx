import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from './providers/apollo/ApolloProvider';
import { ClientConfigProvider } from './providers/clientConfig/clientConfigProvider';
import { AppThemeProvider } from './providers/theme/AppThemeProvider';
import { UserProvider } from './providers/user/UserProvider';
import { App } from './App';

export function AppWrapper() {
  return (
    <ApolloProvider>
      <BrowserRouter>
        <AppThemeProvider>
          <StrictMode>
            <UserProvider>
              <ClientConfigProvider>
                <App />
              </ClientConfigProvider>
            </UserProvider>
          </StrictMode>
        </AppThemeProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}
