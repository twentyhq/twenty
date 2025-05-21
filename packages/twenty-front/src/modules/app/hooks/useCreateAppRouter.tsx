import { AppRouterProviders } from '@/app/components/AppRouterProviders';
import { SettingsRoutes } from '@/app/components/SettingsRoutes';
import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { AppPath } from '@/types/AppPath';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

// Use React.lazy for code splitting with named exports
const SignInUp = React.lazy(() =>
  import('~/pages/auth/SignInUp').then((module) => ({
    default: module.SignInUp,
  })),
);
const PasswordReset = React.lazy(() =>
  import('~/pages/auth/PasswordReset').then((module) => ({
    default: module.PasswordReset,
  })),
);
const NotFound = React.lazy(() =>
  import('~/pages/not-found/NotFound').then((module) => ({
    default: module.NotFound,
  })),
);
const RecordIndexPage = React.lazy(() =>
  import('~/pages/object-record/RecordIndexPage').then((module) => ({
    default: module.RecordIndexPage,
  })),
);
const RecordShowPage = React.lazy(() =>
  import('~/pages/object-record/RecordShowPage').then((module) => ({
    default: module.RecordShowPage,
  })),
);
const ChooseYourPlan = React.lazy(() =>
  import('~/pages/onboarding/ChooseYourPlan').then((module) => ({
    default: module.ChooseYourPlan,
  })),
);
const CreateProfile = React.lazy(() =>
  import('~/pages/onboarding/CreateProfile').then((module) => ({
    default: module.CreateProfile,
  })),
);
const CreateWorkspace = React.lazy(() =>
  import('~/pages/onboarding/CreateWorkspace').then((module) => ({
    default: module.CreateWorkspace,
  })),
);
const InviteTeam = React.lazy(() =>
  import('~/pages/onboarding/InviteTeam').then((module) => ({
    default: module.InviteTeam,
  })),
);
const PaymentSuccess = React.lazy(() =>
  import('~/pages/onboarding/PaymentSuccess').then((module) => ({
    default: module.PaymentSuccess,
  })),
);
const SyncEmails = React.lazy(() =>
  import('~/pages/onboarding/SyncEmails').then((module) => ({
    default: module.SyncEmails,
  })),
);
const Authorize = React.lazy(() =>
  import('~/pages/auth/Authorize').then((module) => ({
    default: module.Authorize,
  })),
);

// Loading component for suspense fallback
const PageLoader = () => <div>Loading...</div>;

export const useCreateAppRouter = (
  isFunctionSettingsEnabled?: boolean,
  isAdminPageEnabled?: boolean,
) =>
  createBrowserRouter(
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
              <Suspense fallback={<PageLoader />}>
                <SignInUp />
              </Suspense>
            }
          />
          <Route
            path={AppPath.Invite}
            element={
              <Suspense fallback={<PageLoader />}>
                <SignInUp />
              </Suspense>
            }
          />
          <Route
            path={AppPath.ResetPassword}
            element={
              <Suspense fallback={<PageLoader />}>
                <PasswordReset />
              </Suspense>
            }
          />
          <Route
            path={AppPath.CreateWorkspace}
            element={
              <Suspense fallback={<PageLoader />}>
                <CreateWorkspace />
              </Suspense>
            }
          />
          <Route
            path={AppPath.CreateProfile}
            element={
              <Suspense fallback={<PageLoader />}>
                <CreateProfile />
              </Suspense>
            }
          />
          <Route
            path={AppPath.SyncEmails}
            element={
              <Suspense fallback={<PageLoader />}>
                <SyncEmails />
              </Suspense>
            }
          />
          <Route
            path={AppPath.InviteTeam}
            element={
              <Suspense fallback={<PageLoader />}>
                <InviteTeam />
              </Suspense>
            }
          />
          <Route
            path={AppPath.PlanRequired}
            element={
              <Suspense fallback={<PageLoader />}>
                <ChooseYourPlan />
              </Suspense>
            }
          />
          <Route
            path={AppPath.PlanRequiredSuccess}
            element={
              <Suspense fallback={<PageLoader />}>
                <PaymentSuccess />
              </Suspense>
            }
          />
          <Route path={indexAppPath.getIndexAppPath()} element={<></>} />
          <Route
            path={AppPath.RecordIndexPage}
            element={
              <Suspense fallback={<PageLoader />}>
                <RecordIndexPage />
              </Suspense>
            }
          />
          <Route
            path={AppPath.RecordShowPage}
            element={
              <Suspense fallback={<PageLoader />}>
                <RecordShowPage />
              </Suspense>
            }
          />
          <Route
            path={AppPath.SettingsCatchAll}
            element={
              <Suspense fallback={<PageLoader />}>
                <SettingsRoutes
                  isFunctionSettingsEnabled={isFunctionSettingsEnabled}
                  isAdminPageEnabled={isAdminPageEnabled}
                />
              </Suspense>
            }
          />
          <Route
            path={AppPath.NotFoundWildcard}
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
        <Route element={<BlankLayout />}>
          <Route
            path={AppPath.Authorize}
            element={
              <Suspense fallback={<PageLoader />}>
                <Authorize />
              </Suspense>
            }
          />
        </Route>
      </Route>,
    ),
  );
