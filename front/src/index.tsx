import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { DialogProvider } from '@/ui/dialog/components/DialogProvider';
import { SnackBarProvider } from '@/ui/snack-bar/components/SnackBarProvider';
import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { ThemeType } from '@/ui/theme/constants/theme';
import { UserProvider } from '@/users/components/UserProvider';

import '@emotion/react';

import { PageChangeEffect } from './effect-components/PageChangeEffect';
import { ApolloClientMetadataProvider } from './modules/metadata/components/ApolloClientMetadataProvider';
import { FetchMetadataEffect } from './modules/metadata/components/FetchMetadataEffect';
import { App } from './App';

import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <RecoilRoot>
    <RecoilDebugObserverEffect />
    <BrowserRouter>
      <ApolloProvider>
        <HelmetProvider>
          <ClientConfigProvider>
            <UserProvider>
              <ApolloClientMetadataProvider>
                <FetchMetadataEffect />
                <PageChangeEffect />
                <AppThemeProvider>
                  <SnackBarProvider>
                    <DialogProvider>
                      <StrictMode>
                        <App />
                      </StrictMode>
                    </DialogProvider>
                  </SnackBarProvider>
                </AppThemeProvider>
              </ApolloClientMetadataProvider>
            </UserProvider>
          </ClientConfigProvider>
        </HelmetProvider>
      </ApolloProvider>
    </BrowserRouter>
  </RecoilRoot>,
);

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}
