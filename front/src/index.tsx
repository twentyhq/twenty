import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { ApolloMetadataClientProvider } from '@/object-metadata/components/ApolloMetadataClientProvider';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { SnackBarManager } from '@/ui/feedback/snack-bar-manager/components/SnackBarManager';
import { SnackBarManagerScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarManagerScope';
import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { ThemeType } from '@/ui/theme/constants/theme';
import { UserProvider } from '@/users/components/UserProvider';

import '@emotion/react';

import { PageChangeEffect } from './effect-components/PageChangeEffect';
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
              <ApolloMetadataClientProvider>
                <SnackBarManagerScope snackBarManagerScopeId="snack-bar-manager">
                  <ObjectMetadataItemsProvider>
                    <PageChangeEffect />
                    <AppThemeProvider>
                      <SnackBarManager>
                        <DialogManagerScope dialogManagerScopeId="dialog-manager">
                          <DialogManager>
                            <StrictMode>
                              <App />
                            </StrictMode>
                          </DialogManager>
                        </DialogManagerScope>
                      </SnackBarManager>
                    </AppThemeProvider>
                  </ObjectMetadataItemsProvider>
                </SnackBarManagerScope>
              </ApolloMetadataClientProvider>
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
