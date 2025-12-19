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
import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';
import { ApolloCoreProvider } from '@/object-metadata/components/ApolloCoreProvider';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { PrefetchDataProvider } from '@/prefetch/components/PrefetchDataProvider';
import { SubscriptionProvider } from '@/subscription/components/SubscriptionProvider';
import { SupportChatEffect } from '@/support/components/SupportChatEffect';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { BaseThemeProvider } from '@/ui/theme/components/BaseThemeProvider';
import { UserThemeProviderEffect } from '@/ui/theme/components/UserThemeProviderEffect';
import { PageFavicon } from '@/ui/utilities/page-favicon/components/PageFavicon';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { UserAndViewsProviderEffect } from '@/users/components/UserAndViewsProviderEffect';
import { UserProvider } from '@/users/components/UserProvider';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';
import { StrictMode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const AppRouterProviders = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);

  return (
    <ApolloProvider>
      <BaseThemeProvider>
        <ClientConfigProviderEffect />
        <UserAndViewsProviderEffect />
        <WorkspaceProviderEffect />
        <ClientConfigProvider>
          <CaptchaProvider>
            <ChromeExtensionSidecarEffect />
            <ChromeExtensionSidecarProvider>
              <UserProvider>
                <AuthProvider>
                  <SubscriptionProvider>
                    <ApolloCoreProvider>
                      <ObjectMetadataItemsLoadEffect />
                      <ObjectMetadataItemsProvider>
                        <PrefetchDataProvider>
                          <UserThemeProviderEffect />
                          <SnackBarProvider>
                            <ErrorMessageEffect />
                            <DialogComponentInstanceContext.Provider
                              value={{ instanceId: 'dialog-manager' }}
                            >
                              <DialogManager>
                                <StrictMode>
                                  <PromiseRejectionEffect />
                                  <GotoHotkeysEffectsProvider />
                                  <PageTitle title={pageTitle} />
                                  <PageFavicon />
                                  <Outlet />
                                </StrictMode>
                              </DialogManager>
                            </DialogComponentInstanceContext.Provider>
                          </SnackBarProvider>
                          <MainContextStoreProvider />
                          <SupportChatEffect />
                        </PrefetchDataProvider>
                        <PageChangeEffect />
                      </ObjectMetadataItemsProvider>
                    </ApolloCoreProvider>
                  </SubscriptionProvider>
                </AuthProvider>
              </UserProvider>
            </ChromeExtensionSidecarProvider>
          </CaptchaProvider>
        </ClientConfigProvider>
      </BaseThemeProvider>
    </ApolloProvider>
  );
};
