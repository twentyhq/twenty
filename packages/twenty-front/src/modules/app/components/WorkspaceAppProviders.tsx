import { StrictMode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AgentChatProvider } from '@/ai/components/AgentChatProvider';
import { ApplicationsLoadEffect } from '@/applications/components/ApplicationsLoadEffect';
import { TrackPageViewEffect } from '@/analytics/components/TrackPageViewEffect';
import { SharedAppProviders } from '@/app/components/SharedAppProviders';
import { GotoHotkeysEffectsProvider } from '@/app/effect-components/GotoHotkeysEffectsProvider';
import { InitializeQueryParamStateEffect } from '@/app/effect-components/InitializeQueryParamStateEffect';
import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { AuthProvider } from '@/auth/components/AuthProvider';
import { SignOutOnOtherTabSignOutEffect } from '@/auth/effect-components/SignOutOnOtherTabSignOutEffect';
import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { RequestFreshCaptchaTokenEffect } from '@/captcha/components/RequestFreshCaptchaTokenEffect';
import { CommandMenuConfirmationModalManager } from '@/command-menu-item/confirmation-modal/components/CommandMenuConfirmationModalManager';
import { CommandRunner } from '@/command-menu-item/engine-command/components/CommandRunner';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';
import { IsMinimalMetadataReadyEffect } from '@/metadata-store/effect-components/IsMinimalMetadataReadyEffect';
import { MinimalMetadataLoadEffect } from '@/metadata-store/effect-components/MinimalMetadataLoadEffect';
import { UserMetadataProviderInitialEffect } from '@/metadata-store/effect-components/UserMetadataProviderInitialEffect';
import { ApolloCoreProvider } from '@/object-metadata/components/ApolloCoreProvider';
import { WelcomeOverlay } from '@/onboarding/components/WelcomeOverlay/WelcomeOverlay';
import { CompanyEnrichmentOnboardingEffect } from '@/onboarding/effect-components/CompanyEnrichmentOnboardingEffect';
import { ApolloAdminProvider } from '@/settings/admin-panel/apollo/components/ApolloAdminProvider';
import { EndTrialAfterPaymentMethodGater } from '@/settings/billing/components/EndTrialAfterPaymentMethodGater';
import { SSEProvider } from '@/sse-db-event/components/SSEProvider';
import { SupportChatEffect } from '@/support/components/SupportChatEffect';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { ShareRecordModal } from '@/record-share/components/ShareRecordModal';
import { GlobalFilePreviewModal } from '@/ui/field/display/components/GlobalFilePreviewModal';
import { UserThemeProviderEffect } from '@/ui/theme/components/UserThemeProviderEffect';
import { UserUiScaleProviderEffect } from '@/ui/theme/components/UserUiScaleProviderEffect';
import { PageFavicon } from '@/ui/utilities/page-favicon/components/PageFavicon';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { UserContextProvider } from '@/users/components/UserContextProvider';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const WorkspaceAppProviders = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);

  return (
    <SharedAppProviders>
      <UserMetadataProviderInitialEffect />
      <MinimalMetadataLoadEffect />
      <IsMinimalMetadataReadyEffect />
      <WorkspaceProviderEffect />
      <CaptchaProvider>
        <UserContextProvider>
          <AuthProvider>
            <ApolloCoreProvider>
              <ApolloAdminProvider>
                <SSEProvider>
                  <ApplicationsLoadEffect />
                  <UserThemeProviderEffect />
                  <UserUiScaleProviderEffect />
                  <ContextStoreComponentInstanceContext.Provider
                    value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
                  >
                    <SnackBarProvider>
                      <ErrorMessageEffect />
                      <AgentChatProvider>
                        <DialogComponentInstanceContext.Provider
                          value={{ instanceId: 'dialog-manager' }}
                        >
                          <DialogManager>
                            <StrictMode>
                              <PromiseRejectionEffect />
                              <EndTrialAfterPaymentMethodGater />
                              <GotoHotkeysEffectsProvider />
                              <PageTitle title={pageTitle} />
                              <PageFavicon />
                              <Outlet />
                              <GlobalFilePreviewModal />
                              <ShareRecordModal />
                              <CommandMenuConfirmationModalManager />
                              <CommandRunner />
                            </StrictMode>
                          </DialogManager>
                        </DialogComponentInstanceContext.Provider>
                      </AgentChatProvider>
                    </SnackBarProvider>
                  </ContextStoreComponentInstanceContext.Provider>
                  <SupportChatEffect />
                  <InitializeQueryParamStateEffect />
                  <TrackPageViewEffect />
                  <RequestFreshCaptchaTokenEffect />
                  <PageChangeEffect />
                  <WelcomeOverlay />
                  <CompanyEnrichmentOnboardingEffect />
                  <SignOutOnOtherTabSignOutEffect />
                </SSEProvider>
              </ApolloAdminProvider>
            </ApolloCoreProvider>
          </AuthProvider>
        </UserContextProvider>
      </CaptchaProvider>
    </SharedAppProviders>
  );
};
