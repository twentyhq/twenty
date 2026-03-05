import { AppRouterProviders } from '@/app/components/AppRouterProviders';
import { SettingsRoutes } from '@/app/components/SettingsRoutes';
import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';

import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import { AppPath } from 'twenty-shared/types';

import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

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

const NotFound = lazy(() =>
  import('~/pages/not-found/NotFound').then((module) => ({
    default: module.NotFound,
  })),
);

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
              <Suspense fallback={null}>
                <SignInUp />
              </Suspense>
            }
          />
          <Route
            path={AppPath.Invite}
            element={
              <Suspense fallback={null}>
                <SignInUp />
              </Suspense>
            }
          />
          <Route
            path={AppPath.ResetPassword}
            element={
              <Suspense fallback={null}>
                <PasswordReset />
              </Suspense>
            }
          />
          <Route
            path={AppPath.CreateWorkspace}
            element={
              <Suspense fallback={null}>
                <CreateWorkspace />
              </Suspense>
            }
          />
          <Route
            path={AppPath.CreateProfile}
            element={
              <Suspense fallback={null}>
                <CreateProfile />
              </Suspense>
            }
          />
          <Route
            path={AppPath.SyncEmails}
            element={
              <Suspense fallback={null}>
                <SyncEmails />
              </Suspense>
            }
          />
          <Route
            path={AppPath.InviteTeam}
            element={
              <Suspense fallback={null}>
                <InviteTeam />
              </Suspense>
            }
          />
          <Route
            path={AppPath.PlanRequired}
            element={
              <Suspense fallback={null}>
                <ChooseYourPlan />
              </Suspense>
            }
          />
          <Route
            path={AppPath.PlanRequiredSuccess}
            element={
              <Suspense fallback={null}>
                <PaymentSuccess />
              </Suspense>
            }
          />
          <Route
            path={AppPath.BookCallDecision}
            element={
              <Suspense fallback={null}>
                <BookCallDecision />
              </Suspense>
            }
          />
          <Route
            path={AppPath.BookCall}
            element={
              <Suspense fallback={null}>
                <BookCall />
              </Suspense>
            }
          />
          <Route path={indexAppPath.getIndexAppPath()} element={<></>} />
          <Route
            path={AppPath.RecordIndexPage}
            element={
              <Suspense fallback={null}>
                <RecordIndexPage />
              </Suspense>
            }
          />
          <Route
            path={AppPath.RecordShowPage}
            element={
              <Suspense fallback={null}>
                <RecordShowPage />
              </Suspense>
            }
          />
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
              <Suspense fallback={null}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
        <Route element={<BlankLayout />}>
          <Route
            path={AppPath.Authorize}
            element={
              <Suspense fallback={null}>
                <Authorize />
              </Suspense>
            }
          />
        </Route>
      </Route>,
    ),
  );
