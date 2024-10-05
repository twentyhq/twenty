import { StrictMode } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { AuthProvider } from '@/auth/components/AuthProvider';
import { VerifyEffect } from '@/auth/components/VerifyEffect';
import { ChromeExtensionSidecarEffect } from '@/chrome-extension-sidecar/components/ChromeExtensionSidecarEffect';
import { ChromeExtensionSidecarProvider } from '@/chrome-extension-sidecar/components/ChromeExtensionSidecarProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { billingState } from '@/client-config/states/billingState';
import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { ApolloMetadataClientProvider } from '@/object-metadata/components/ApolloMetadataClientProvider';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { PrefetchDataProvider } from '@/prefetch/components/PrefetchDataProvider';
import { AppPath } from '@/types/AppPath';
import { DialogManager } from '@/ui/feedback/dialog-manager/components/DialogManager';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { BlankLayout } from '@/ui/layout/page/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/DefaultLayout';
import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { UserProvider } from '@/users/components/UserProvider';
import { UserProviderEffect } from '@/users/components/UserProviderEffect';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { CommandMenuEffect } from '~/effect-components/CommandMenuEffect';
import { GotoHotkeysEffect } from '~/effect-components/GotoHotkeysEffect';
import { PageChangeEffect } from '~/effect-components/PageChangeEffect';
import { Authorize } from '~/pages/auth/Authorize';
import { Invite } from '~/pages/auth/Invite';
import { PasswordReset } from '~/pages/auth/PasswordReset';
import { SignInUp } from '~/pages/auth/SignInUp';
import { ImpersonateEffect } from '~/pages/impersonate/ImpersonateEffect';
import { NotFound } from '~/pages/not-found/NotFound';
import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import { RecordShowPage } from '~/pages/object-record/RecordShowPage';
import { ChooseYourPlan } from '~/pages/onboarding/ChooseYourPlan';
import { CreateProfile } from '~/pages/onboarding/CreateProfile';
import { CreateWorkspace } from '~/pages/onboarding/CreateWorkspace';
import { InviteTeam } from '~/pages/onboarding/InviteTeam';
import { PaymentSuccess } from '~/pages/onboarding/PaymentSuccess';
import { SyncEmails } from '~/pages/onboarding/SyncEmails';
import { SettingsRoutes } from '~/SettingsRoutes';
import { getPageTitleFromPath } from '~/utils/title-utils';

const ProvidersThatNeedRouterContext = () => {
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
                              <GotoHotkeysEffect />
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

const createRouter = (
  isBillingEnabled?: boolean,
  isCRMMigrationEnabled?: boolean,
  isServerlessFunctionSettingsEnabled?: boolean,
) =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route
        element={<ProvidersThatNeedRouterContext />}
        // To switch state to `loading` temporarily to enable us
        // to set scroll position before the page is rendered
        loader={async () => Promise.resolve(null)}
      >
        <Route element={<DefaultLayout />}>
          <Route path={AppPath.Verify} element={<VerifyEffect />} />
          <Route path={AppPath.SignInUp} element={<SignInUp />} />
          <Route path={AppPath.Invite} element={<Invite />} />
          <Route path={AppPath.ResetPassword} element={<PasswordReset />} />
          <Route path={AppPath.CreateWorkspace} element={<CreateWorkspace />} />
          <Route path={AppPath.CreateProfile} element={<CreateProfile />} />
          <Route path={AppPath.SyncEmails} element={<SyncEmails />} />
          <Route path={AppPath.InviteTeam} element={<InviteTeam />} />
          <Route path={AppPath.PlanRequired} element={<ChooseYourPlan />} />
          <Route
            path={AppPath.PlanRequiredSuccess}
            element={<PaymentSuccess />}
          />
          <Route path={indexAppPath.getIndexAppPath()} element={<></>} />
          <Route path={AppPath.Impersonate} element={<ImpersonateEffect />} />
          <Route path={AppPath.RecordIndexPage} element={<RecordIndexPage />} />
          <Route path={AppPath.RecordShowPage} element={<RecordShowPage />} />
          <Route
            path={AppPath.SettingsCatchAll}
            element={
              <SettingsRoutes
                isBillingEnabled={isBillingEnabled}
                isCRMMigrationEnabled={isCRMMigrationEnabled}
                isServerlessFunctionSettingsEnabled={
                  isServerlessFunctionSettingsEnabled
                }
              />
            }
          />
          <Route path={AppPath.NotFoundWildcard} element={<NotFound />} />
        </Route>
        <Route element={<BlankLayout />}>
          <Route path={AppPath.Authorize} element={<Authorize />} />
        </Route>
      </Route>,
    ),
  );

export const App = () => {
  const billing = useRecoilValue(billingState);
  const isFreeAccessEnabled = useIsFeatureEnabled('IS_FREE_ACCESS_ENABLED');
  const isCRMMigrationEnabled = useIsFeatureEnabled('IS_CRM_MIGRATION_ENABLED');
  const isServerlessFunctionSettingsEnabled = useIsFeatureEnabled(
    'IS_FUNCTION_SETTINGS_ENABLED',
  );

  const isBillingPageEnabled =
    billing?.isBillingEnabled && !isFreeAccessEnabled;

  return (
    <RouterProvider
      router={createRouter(
        isBillingPageEnabled,
        isCRMMigrationEnabled,
        isServerlessFunctionSettingsEnabled,
      )}
    />
  );
};
