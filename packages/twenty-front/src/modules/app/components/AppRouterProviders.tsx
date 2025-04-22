import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { GotoHotkeysEffectsProvider } from '@/app/effect-components/GotoHotkeysEffectsProvider';
import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { AuthProvider } from '@/auth/components/AuthProvider';
import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { ChromeExtensionSidecarEffect } from '@/chrome-extension-sidecar/components/ChromeExtensionSidecarEffect';
import { ChromeExtensionSidecarProvider } from '@/chrome-extension-sidecar/components/ChromeExtensionSidecarProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { MainContextStoreProvider } from '@/context-store/components/MainContextStoreProvider';
import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';
import { ApolloMetadataClientProvider } from '@/object-metadata/components/ApolloMetadataClientProvider';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { PrefetchDataProvider } from '@/prefetch/components/PrefetchDataProvider';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { BaseThemeProvider } from '@/ui/theme/components/BaseThemeProvider';
import { UserThemeProviderEffect } from '@/ui/theme/components/UserThemeProviderEffect';
import { PageFavicon } from '@/ui/utilities/page-favicon/components/PageFavicon';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ServerPreconnect } from '@/ui/utilities/server-preconnect/components/ServerPreconnect';
import { UserProvider } from '@/users/components/UserProvider';
import { UserProviderEffect } from '@/users/components/UserProviderEffect';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';
import { StrictMode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const AppRouterProviders = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);

  return (
    <CaptchaProvider>
      <ApolloProvider>
        <BaseThemeProvider>
          <ClientConfigProviderEffect />
          <ClientConfigProvider>
            <ChromeExtensionSidecarEffect />
            <ChromeExtensionSidecarProvider>
              <UserProviderEffect />
              <WorkspaceProviderEffect />
              <UserProvider>
                <AuthProvider>
                  <ApolloMetadataClientProvider>
                    <ObjectMetadataItemsLoadEffect />
                    <ObjectMetadataItemsProvider>
                      <PrefetchDataProvider>
                        <UserThemeProviderEffect />
                        <SnackBarProvider>
                          <DialogManagerScope dialogManagerScopeId="dialog-manager">
                            <DialogManager>
                              <StrictMode>
                                <PromiseRejectionEffect />
                                <GotoHotkeysEffectsProvider />
                                <ServerPreconnect />
                                <PageTitle title={pageTitle} />
                                <PageFavicon />
                                <Outlet />
                              </StrictMode>
                            </DialogManager>
                          </DialogManagerScope>
                        </SnackBarProvider>
                        <MainContextStoreProvider />
                      </PrefetchDataProvider>
                      <PageChangeEffect />
                    </ObjectMetadataItemsProvider>
                  </ApolloMetadataClientProvider>
                </AuthProvider>
              </UserProvider>
            </ChromeExtensionSidecarProvider>
          </ClientConfigProvider>
        </BaseThemeProvider>
      </ApolloProvider>
    </CaptchaProvider>
  );
};
