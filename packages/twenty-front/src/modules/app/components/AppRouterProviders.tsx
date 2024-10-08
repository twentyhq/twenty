import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { CommandMenuEffect } from '@/app/effect-components/CommandMenuEffect';
import { GotoHotkeys } from '@/app/effect-components/GotoHotkeysEffect';
import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { AuthProvider } from '@/auth/components/AuthProvider';
import { ChromeExtensionSidecarEffect } from '@/chrome-extension-sidecar/components/ChromeExtensionSidecarEffect';
import { ChromeExtensionSidecarProvider } from '@/chrome-extension-sidecar/components/ChromeExtensionSidecarProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';
import { ApolloMetadataClientProvider } from '@/object-metadata/components/ApolloMetadataClientProvider';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { PrefetchDataProvider } from '@/prefetch/components/PrefetchDataProvider';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { UserProvider } from '@/users/components/UserProvider';
import { UserProviderEffect } from '@/users/components/UserProviderEffect';
import { StrictMode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const AppRouterProviders = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);

  return (
    <ApolloProvider>
      <ClientConfigProviderEffect />
      <ClientConfigProvider>
        <ChromeExtensionSidecarEffect />
        <ChromeExtensionSidecarProvider>
          <UserProviderEffect />
          <UserProvider>
            <AuthProvider>
              <ApolloMetadataClientProvider>
                <ObjectMetadataItemsProvider>
                  <PrefetchDataProvider>
                    <AppThemeProvider>
                      <SnackBarProvider>
                        <DialogManagerScope dialogManagerScopeId="dialog-manager">
                          <DialogManager>
                            <StrictMode>
                              <PromiseRejectionEffect />
                              <CommandMenuEffect />
                              <GotoHotkeys />
                              <PageTitle title={pageTitle} />
                              <Outlet />
                            </StrictMode>
                          </DialogManager>
                        </DialogManagerScope>
                      </SnackBarProvider>
                    </AppThemeProvider>
                  </PrefetchDataProvider>
                  <PageChangeEffect />
                </ObjectMetadataItemsProvider>
              </ApolloMetadataClientProvider>
            </AuthProvider>
          </UserProvider>
        </ChromeExtensionSidecarProvider>
      </ClientConfigProvider>
    </ApolloProvider>
  );
};
