import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/components/SpreadsheetImportProvider';
import { DialogProvider } from '@/ui/dialog/components/DialogProvider';
import { SnackBarProvider } from '@/ui/snack-bar/components/SnackBarProvider';
import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { ThemeType } from '@/ui/theme/constants/theme';
import { UserProvider } from '@/users/components/UserProvider';

import '@emotion/react';

import { AuthAutoRouter } from './sync-hooks/AuthAutoRouter';
import { App } from './App';

import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <RecoilRoot>
    <BrowserRouter>
      <ApolloProvider>
        <ClientConfigProvider>
          <UserProvider>
            <AuthAutoRouter />
            <AppThemeProvider>
              <SnackBarProvider>
                <DialogProvider>
                  <SpreadsheetImportProvider>
                    <StrictMode>
                      <App />
                    </StrictMode>
                  </SpreadsheetImportProvider>
                </DialogProvider>
              </SnackBarProvider>
            </AppThemeProvider>
          </UserProvider>
        </ClientConfigProvider>
      </ApolloProvider>
    </BrowserRouter>
  </RecoilRoot>,
);

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}
