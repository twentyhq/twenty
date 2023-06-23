import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from './providers/apollo/ApolloProvider';
import { AppThemeProvider } from './providers/theme/AppThemeProvider';
import { App } from './App';

export function AppWrapper() {
  return (
    <ApolloProvider>
      <BrowserRouter>
        <AppThemeProvider>
          <StrictMode>
            <App />
          </StrictMode>
        </AppThemeProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}
