import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { GotoHotkeysEffectsProvider } from '@/app/effect-components/GotoHotkeysEffectsProvider';
import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { AuthProvider } from '@/auth/components/AuthProvider';
import { ChromeExtensionSidecarEffect } from '@/chrome-extension-sidecar/components/ChromeExtensionSidecarEffect';
import { ChromeExtensionSidecarProvider } from '@/chrome-extension-sidecar/components/ChromeExtensionSidecarProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { ContextStoreViewIdEffect } from '@/context-store/components/ContextStoreViewIdEffect';
import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';
import { ApolloMetadataClientProvider } from '@/object-metadata/components/ApolloMetadataClientProvider';
import { ObjectMetadataItemsGater } from '@/object-metadata/components/ObjectMetadataItemsGater';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { PrefetchDataProvider } from '@/prefetch/components/PrefetchDataProvider';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { UserThemeProviderEffect } from '@/ui/theme/components/AppThemeProvider';
import { BaseThemeProvider } from '@/ui/theme/components/BaseThemeProvider';
import { PageFavicon } from '@/ui/utilities/page-favicon/components/PageFavicon';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { UserProvider } from '@/users/components/UserProvider';
import { UserProviderEffect } from '@/users/components/UserProviderEffect';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';
import { isNonEmptyString } from '@sniptt/guards';
import { StrictMode } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const AppRouterProviders = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);
  const objectNamePlural = useParams().objectNamePlural;

  return (
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
                  <ObjectMetadataItemsProvider>
                    <ObjectMetadataItemsGater>
                      <PrefetchDataProvider>
                        <UserThemeProviderEffect />
                        <SnackBarProvider>
                          <DialogManagerScope dialogManagerScopeId="dialog-manager">
                            <DialogManager>
                              <StrictMode>
                                <PromiseRejectionEffect />
                                <GotoHotkeysEffectsProvider />
                                <PageTitle title={pageTitle} />
                                <PageFavicon />
                                <Outlet />
                              </StrictMode>
                            </DialogManager>
                          </DialogManagerScope>
                        </SnackBarProvider>
                      </PrefetchDataProvider>
                    </ObjectMetadataItemsGater>
                    <PageChangeEffect />
                    {isNonEmptyString(objectNamePlural) && (
                      <ContextStoreViewIdEffect
                        objectNamePlural={objectNamePlural}
                      />
                    )}
                  </ObjectMetadataItemsProvider>
                </ApolloMetadataClientProvider>
              </AuthProvider>
            </UserProvider>
          </ChromeExtensionSidecarProvider>
        </ClientConfigProvider>
      </BaseThemeProvider>
    </ApolloProvider>
  );
};
