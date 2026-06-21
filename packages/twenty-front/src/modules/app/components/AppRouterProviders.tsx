import { AgentChatProvider } from '@/ai/components/AgentChatProvider';
import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { CommandMenuConfirmationModalManager } from '@/command-menu-item/confirmation-modal/components/CommandMenuConfirmationModalManager';
import { MinimalMetadataGater } from '@/metadata-store/components/MinimalMetadataGater';
import { IsMinimalMetadataReadyEffect } from '@/metadata-store/effect-components/IsMinimalMetadataReadyEffect';

import { GotoHotkeysEffectsProvider } from '@/app/effect-components/GotoHotkeysEffectsProvider';
import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { AuthProvider } from '@/auth/components/AuthProvider';
import { ONBOARDING_PATHS } from '@/auth/constants/OnboardingPaths';
import { ONGOING_USER_CREATION_PATHS } from '@/auth/constants/OngoingUserCreationPaths';
import { SignOutOnOtherTabSignOutEffect } from '@/auth/effect-components/SignOutOnOtherTabSignOutEffect';
import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { MainContextStoreProvider } from '@/context-store/components/MainContextStoreProvider';
import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';
import { MinimalMetadataLoadEffect } from '@/metadata-store/effect-components/MinimalMetadataLoadEffect';
import { UserMetadataProviderInitialEffect } from '@/metadata-store/effect-components/UserMetadataProviderInitialEffect';
import { ApolloCoreProvider } from '@/object-metadata/components/ApolloCoreProvider';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { ApolloAdminProvider } from '@/settings/admin-panel/apollo/components/ApolloAdminProvider';

import { CommandRunner } from '@/command-menu-item/engine-command/components/CommandRunner';
import { SSEProvider } from '@/sse-db-event/components/SSEProvider';
import { SupportChatEffect } from '@/support/components/SupportChatEffect';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { GlobalFilePreviewModal } from '@/ui/field/display/components/GlobalFilePreviewModal';
import { BaseThemeProvider } from '@/ui/theme/components/BaseThemeProvider';
import { UserThemeProviderEffect } from '@/ui/theme/components/UserThemeProviderEffect';
import { PageFavicon } from '@/ui/utilities/page-favicon/components/PageFavicon';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';
import { StrictMode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isMatchingLocation } from '~/utils/isMatchingLocation';
import { getPageTitleFromPath } from '~/utils/title-utils';

const AUTH_AND_ONBOARDING_PATHS = [
  ...ONGOING_USER_CREATION_PATHS,
  ...ONBOARDING_PATHS,
  AppPath.ResetPassword,
];

export const AppRouterProviders = () => {
  const location = useLocation();
  const pageTitle = getPageTitleFromPath(location.pathname);
  const isSupportChatEnabledForRoute = !AUTH_AND_ONBOARDING_PATHS.some(
    (appPath) => isMatchingLocation(location, appPath),
  );

  return (
    <ApolloProvider>
      <BaseThemeProvider>
        <ClientConfigProviderEffect />
        <UserMetadataProviderInitialEffect />
        <MinimalMetadataLoadEffect />
        <IsMinimalMetadataReadyEffect />
        <WorkspaceProviderEffect />
        <ClientConfigProvider>
          <CaptchaProvider>
            <MinimalMetadataGater>
              <AuthProvider>
                <ApolloCoreProvider>
                  <ApolloAdminProvider>
                    <SSEProvider>
                      <PreComputedChipGeneratorsProvider>
                        <UserThemeProviderEffect />
                        <SnackBarProvider>
                          <ErrorMessageEffect />
                          <AgentChatProvider>
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
                                  <GlobalFilePreviewModal />
                                  <CommandMenuConfirmationModalManager />
                                  <CommandRunner />
                                </StrictMode>
                              </DialogManager>
                            </DialogComponentInstanceContext.Provider>
                          </AgentChatProvider>
                        </SnackBarProvider>
                        <MainContextStoreProvider />
                        {isSupportChatEnabledForRoute && <SupportChatEffect />}
                        <PageChangeEffect />
                        <SignOutOnOtherTabSignOutEffect />
                      </PreComputedChipGeneratorsProvider>
                    </SSEProvider>
                  </ApolloAdminProvider>
                </ApolloCoreProvider>
              </AuthProvider>
            </MinimalMetadataGater>
          </CaptchaProvider>
        </ClientConfigProvider>
      </BaseThemeProvider>
    </ApolloProvider>
  );
};
