import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { INITIAL_HOTKEYS_SCOPES } from '@/ui/hotkey/constants';
import { SnackBarProvider } from '@/ui/snack-bar/components/SnackBarProvider';
import { AppThemeProvider } from '@/ui/themes/components/AppThemeProvider';
import { ThemeType } from '@/ui/themes/themes';
import { UserProvider } from '@/users/components/UserProvider';

import '@emotion/react';

import { App } from './App';

import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <RecoilRoot>
    <ApolloProvider>
      <AppThemeProvider>
        <StrictMode>
          <BrowserRouter>
            <UserProvider>
              <SnackBarProvider>
                <ClientConfigProvider>
                  <HotkeysProvider
                    initiallyActiveScopes={INITIAL_HOTKEYS_SCOPES}
                  >
                    <App />
                  </HotkeysProvider>
                </ClientConfigProvider>
              </SnackBarProvider>
            </UserProvider>
          </BrowserRouter>
        </StrictMode>
      </AppThemeProvider>
    </ApolloProvider>
  </RecoilRoot>,
);

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}
