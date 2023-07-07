import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { INITIAL_HOTKEYS_SCOPES } from '@/hotkeys/constants';
import { ThemeType } from '@/ui/themes/themes';

import '@emotion/react';

import { ApolloProvider } from './providers/apollo/ApolloProvider';
import { ClientConfigProvider } from './providers/clientConfig/ClientConfigProvider';
import { AppThemeProvider } from './providers/theme/AppThemeProvider';
import { UserProvider } from './providers/user/UserProvider';
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
          <UserProvider>
            <BrowserRouter>
              <ClientConfigProvider>
                <HotkeysProvider initiallyActiveScopes={INITIAL_HOTKEYS_SCOPES}>
                  <App />
                </HotkeysProvider>
              </ClientConfigProvider>
            </BrowserRouter>
          </UserProvider>
        </StrictMode>
      </AppThemeProvider>
    </ApolloProvider>
  </RecoilRoot>,
);

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}
