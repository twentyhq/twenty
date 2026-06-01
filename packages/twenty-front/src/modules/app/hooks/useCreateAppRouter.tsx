import { AppRouterProviders } from '@/app/components/AppRouterProviders';
import { LazyRoute } from '@/app/components/LazyRoute';
import { SettingsRoutes } from '@/app/components/SettingsRoutes';
import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';

import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import { AppPath } from 'twenty-shared/types';

import { lazy } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import { REACT_APP_SHAHRYAR_MODE } from '~/config';
import { SHAHRYAR_APP_PATHS } from '@/shahryar/constants/shahryar-routes';

const RecordIndexPage = lazy(() =>
  import('~/pages/object-record/RecordIndexPage').then((module) => ({
    default: module.RecordIndexPage,
  })),
);

const RecordShowPage = lazy(() =>
  import('~/pages/object-record/RecordShowPage').then((module) => ({
    default: module.RecordShowPage,
  })),
);

const SignInUp = lazy(() =>
  import('~/pages/auth/SignInUp').then((module) => ({
    default: module.SignInUp,
  })),
);

const PasswordReset = lazy(() =>
  import('~/pages/auth/PasswordReset').then((module) => ({
    default: module.PasswordReset,
  })),
);

const Authorize = lazy(() =>
  import('~/pages/auth/Authorize').then((module) => ({
    default: module.Authorize,
  })),
);

const CreateWorkspace = lazy(() =>
  import('~/pages/onboarding/CreateWorkspace').then((module) => ({
    default: module.CreateWorkspace,
  })),
);

const CreateProfile = lazy(() =>
  import('~/pages/onboarding/CreateProfile').then((module) => ({
    default: module.CreateProfile,
  })),
);

const SyncEmails = lazy(() =>
  import('~/pages/onboarding/SyncEmails').then((module) => ({
    default: module.SyncEmails,
  })),
);

const InviteTeam = lazy(() =>
  import('~/pages/onboarding/InviteTeam').then((module) => ({
    default: module.InviteTeam,
  })),
);

const ChooseYourPlan = lazy(() =>
  import('~/pages/onboarding/ChooseYourPlan').then((module) => ({
    default: module.ChooseYourPlan,
  })),
);

const PaymentSuccess = lazy(() =>
  import('~/pages/onboarding/PaymentSuccess').then((module) => ({
    default: module.PaymentSuccess,
  })),
);

const BookCallDecision = lazy(() =>
  import('~/pages/onboarding/BookCallDecision').then((module) => ({
    default: module.BookCallDecision,
  })),
);

const BookCall = lazy(() =>
  import('~/pages/onboarding/BookCall').then((module) => ({
    default: module.BookCall,
  })),
);

const StandalonePageLayoutPage = lazy(() =>
  import('~/pages/page-layout/StandalonePageLayoutPage').then((module) => ({
    default: module.StandalonePageLayoutPage,
  })),
);

const ShahryarDashboardPage = lazy(() =>
  import('@/shahryar/pages/ShahryarDashboardPage').then((module) => ({
    default: module.ShahryarDashboardPage,
  })),
);

const ShahryarReportsPage = lazy(() =>
  import('@/shahryar/pages/ShahryarReportsPage').then((module) => ({
    default: module.ShahryarReportsPage,
  })),
);

const ShahryarAdminPage = lazy(() =>
  import('@/shahryar/pages/ShahryarAdminPage').then((module) => ({
    default: module.ShahryarAdminPage,
  })),
);

const ShahryarMobileAppPage = lazy(() =>
  import('@/shahryar/pages/ShahryarMobileAppPage').then((module) => ({
    default: module.ShahryarMobileAppPage,
  })),
);

const ShahryarBackupsPage = lazy(() =>
  import('@/shahryar/pages/ShahryarBackupsPage').then((module) => ({
    default: module.ShahryarBackupsPage,
  })),
);

const ShahryarRecordSectionPage = lazy(() =>
  import('@/shahryar/pages/ShahryarRecordSectionPage').then((module) => ({
    default: module.ShahryarRecordSectionPage,
  })),
);

const NotFound = lazy(() =>
  import('~/pages/not-found/NotFound').then((module) => ({
    default: module.NotFound,
  })),
);

export const useCreateAppRouter = (
  isFunctionSettingsEnabled?: boolean,
  isAdminPageEnabled?: boolean,
) => {
  const shouldExposeTwentyProductRoutes = !REACT_APP_SHAHRYAR_MODE;

  return createBrowserRouter(
    createRoutesFromElements(
      <Route
        element={<AppRouterProviders />}
        // To switch state to `loading` temporarily to enable us
        // to set scroll position before the page is rendered
        loader={async () => Promise.resolve(null)}
      >
        <Route element={<DefaultLayout />}>
          <Route path={AppPath.Verify} element={<VerifyLoginTokenEffect />} />
          <Route path={AppPath.VerifyEmail} element={<VerifyEmailEffect />} />
          <Route
            path={AppPath.SignInUp}
            element={
              <LazyRoute fallback={null}>
                <SignInUp />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.Invite}
            element={
              <LazyRoute fallback={null}>
                <SignInUp />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.ResetPassword}
            element={
              <LazyRoute fallback={null}>
                <PasswordReset />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.CreateWorkspace}
            element={
              <LazyRoute fallback={null}>
                <CreateWorkspace />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.CreateProfile}
            element={
              <LazyRoute fallback={null}>
                <CreateProfile />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.InviteTeam}
            element={
              <LazyRoute fallback={null}>
                <InviteTeam />
              </LazyRoute>
            }
          />
          {shouldExposeTwentyProductRoutes && (
            <>
              <Route
                path={AppPath.SyncEmails}
                element={
                  <LazyRoute fallback={null}>
                    <SyncEmails />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.PlanRequired}
                element={
                  <LazyRoute fallback={null}>
                    <ChooseYourPlan />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.PlanRequiredSuccess}
                element={
                  <LazyRoute fallback={null}>
                    <PaymentSuccess />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.BookCallDecision}
                element={
                  <LazyRoute fallback={null}>
                    <BookCallDecision />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.BookCall}
                element={
                  <LazyRoute fallback={null}>
                    <BookCall />
                  </LazyRoute>
                }
              />
            </>
          )}
          <Route path={indexAppPath.getIndexAppPath()} element={<></>} />
          {REACT_APP_SHAHRYAR_MODE && (
            <>
              <Route
                path={SHAHRYAR_APP_PATHS.Dashboard}
                element={
                  <LazyRoute>
                    <ShahryarDashboardPage />
                  </LazyRoute>
                }
              />
              <Route
                path={SHAHRYAR_APP_PATHS.Reports}
                element={
                  <LazyRoute>
                    <ShahryarReportsPage />
                  </LazyRoute>
                }
              />
              <Route
                path={SHAHRYAR_APP_PATHS.MobileApp}
                element={
                  <LazyRoute>
                    <ShahryarMobileAppPage />
                  </LazyRoute>
                }
              />
              <Route
                path={SHAHRYAR_APP_PATHS.Admin}
                element={
                  <LazyRoute>
                    <ShahryarAdminPage />
                  </LazyRoute>
                }
              />
              <Route
                path={SHAHRYAR_APP_PATHS.Backups}
                element={
                  <LazyRoute>
                    <ShahryarBackupsPage />
                  </LazyRoute>
                }
              />
              {[
                SHAHRYAR_APP_PATHS.Markets,
                SHAHRYAR_APP_PATHS.SupervisorVisits,
                SHAHRYAR_APP_PATHS.WorkingTimes,
                SHAHRYAR_APP_PATHS.Payments,
                SHAHRYAR_APP_PATHS.SupervisorPenalties,
                SHAHRYAR_APP_PATHS.Absences,
              ].map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <LazyRoute>
                      <ShahryarRecordSectionPage />
                    </LazyRoute>
                  }
                />
              ))}
            </>
          )}
          {shouldExposeTwentyProductRoutes && (
            <>
              <Route
                path={AppPath.RecordIndexPage}
                element={
                  <LazyRoute>
                    <RecordIndexPage />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.RecordShowPage}
                element={
                  <LazyRoute>
                    <RecordShowPage />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.PageLayoutPage}
                element={
                  <LazyRoute>
                    <StandalonePageLayoutPage />
                  </LazyRoute>
                }
              />
            </>
          )}
          <Route
            path={AppPath.SettingsCatchAll}
            element={
              <SettingsRoutes
                isFunctionSettingsEnabled={isFunctionSettingsEnabled}
                isAdminPageEnabled={isAdminPageEnabled}
              />
            }
          />
          <Route
            path={AppPath.NotFoundWildcard}
            element={
              <LazyRoute>
                <NotFound />
              </LazyRoute>
            }
          />
        </Route>
        <Route element={<BlankLayout />}>
          {shouldExposeTwentyProductRoutes && (
            <Route
              path={AppPath.Authorize}
              element={
                <LazyRoute>
                  <Authorize />
                </LazyRoute>
              }
            />
          )}
        </Route>
      </Route>,
    ),
  );
};
