import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { INITIAL_HOTKEYS_SCOPES } from '@/hotkeys/constants';
import { ThemeType } from '@/ui/themes/themes';

import '@emotion/react';

import { ApolloProvider } from './providers/apollo/ApolloProvider';
import { ClientConfigProvider } from './providers/client-config/ClientConfigProvider';
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
          <BrowserRouter>
            <UserProvider>
              <ClientConfigProvider>
                <HotkeysProvider initiallyActiveScopes={INITIAL_HOTKEYS_SCOPES}>
                  <App />
                </HotkeysProvider>
              </ClientConfigProvider>
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
