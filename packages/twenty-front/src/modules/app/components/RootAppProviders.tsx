import { StrictMode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { TrackPageViewEffect } from '@/analytics/components/TrackPageViewEffect';
import { SharedAppProviders } from '@/app/components/SharedAppProviders';
import { InitializeQueryParamStateEffect } from '@/app/effect-components/InitializeQueryParamStateEffect';
import { AuthProvider } from '@/auth/components/AuthProvider';
import { SignOutOnOtherTabSignOutEffect } from '@/auth/effect-components/SignOutOnOtherTabSignOutEffect';
import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { RequestFreshCaptchaTokenEffect } from '@/captcha/components/RequestFreshCaptchaTokenEffect';
import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';
import { UserMetadataProviderInitialEffect } from '@/metadata-store/effect-components/UserMetadataProviderInitialEffect';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { PageFavicon } from '@/ui/utilities/page-favicon/components/PageFavicon';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const RootAppProviders = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);

  return (
    <SharedAppProviders>
      <CaptchaProvider>
        <UserMetadataProviderInitialEffect />
        <WorkspaceProviderEffect />
        <AuthProvider>
          <SnackBarProvider>
            <ErrorMessageEffect />
            <DialogComponentInstanceContext.Provider
              value={{ instanceId: 'dialog-manager' }}
            >
              <DialogManager>
                <StrictMode>
                  <PromiseRejectionEffect />
                  <PageTitle title={pageTitle} />
                  <PageFavicon />
                  <Outlet />
                  <InitializeQueryParamStateEffect />
                  <TrackPageViewEffect />
                  <RequestFreshCaptchaTokenEffect />
                  <SignOutOnOtherTabSignOutEffect />
                </StrictMode>
              </DialogManager>
            </DialogComponentInstanceContext.Provider>
          </SnackBarProvider>
        </AuthProvider>
      </CaptchaProvider>
    </SharedAppProviders>
  );
};
