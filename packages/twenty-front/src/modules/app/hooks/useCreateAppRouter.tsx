import { AppRouterProviders } from '@/app/components/AppRouterProviders';
import { LazyRoute } from '@/app/components/LazyRoute';
import { SettingsRoutes } from '@/app/components/SettingsRoutes';

import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { OnboardingPageLoader } from '@/onboarding/components/OnboardingPageLoader';
import { OnboardingTransitionOutlet } from '@/onboarding/components/OnboardingTransitionOutlet';
import { Verify } from '~/pages/onboarding/Verify';
import { lazyWithPreload } from '~/utils/lazyWithPreload';
import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import { MainAppLayoutWithSidePanel } from '@/ui/layout/page/components/MainAppLayoutWithSidePanel';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { lazy } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
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

const WorkspaceActivation = lazyWithPreload(() =>
  import('~/pages/onboarding/WorkspaceActivation').then((module) => ({
    default: module.WorkspaceActivation,
  })),
);

const CreateProfile = lazyWithPreload(() =>
  import('~/pages/onboarding/CreateProfile').then((module) => ({
    default: module.CreateProfile,
  })),
);

const SyncEmails = lazyWithPreload(() =>
  import('~/pages/onboarding/SyncEmails').then((module) => ({
    default: module.SyncEmails,
  })),
);

const InstallApps = lazyWithPreload(() =>
  import('~/pages/onboarding/InstallApps').then((module) => ({
    default: module.InstallApps,
  })),
);

const InviteTeam = lazyWithPreload(() =>
  import('~/pages/onboarding/InviteTeam').then((module) => ({
    default: module.InviteTeam,
  })),
);

const ChooseYourPlan = lazyWithPreload(() =>
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

const NotFound = lazy(() =>
  import('~/pages/not-found/NotFound').then((module) => ({
    default: module.NotFound,
  })),
);

const preloadOnboardingPages = () => {
  void WorkspaceActivation.preload();
  void CreateProfile.preload();
  void SyncEmails.preload();
  void InstallApps.preload();
  void InviteTeam.preload();
  void ChooseYourPlan.preload();

  return null;
};

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
          <Route path={AppPath.VerifyEmail} element={<VerifyEmailEffect />} />
          <Route
            path={AppPath.ResetPassword}
            element={
              <LazyRoute fallback={null}>
                <PasswordReset />
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
          <Route element={<MainAppLayoutWithSidePanel />}>
            <Route path={indexAppPath.getIndexAppPath()} element={<></>} />
            <Route
              path={AppPath.RecordIndexPage}
              element={
                <LazyRoute fallback={<RecordIndexSkeletonLoader />}>
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
            <Route
              path={AppPath.SettingsCatchAll}
              element={
                <SettingsRoutes
                  isFunctionSettingsEnabled={isFunctionSettingsEnabled}
                  isAdminPageEnabled={isAdminPageEnabled}
                />
              }
            />
            {/* Deep link for twenty.com/dpa → in-app generator. This route is
                inside the authenticated layout, so an unauthenticated hit is
                login-gated and returns here after sign-in. */}
            <Route
              path={AppPath.Dpa}
              element={
                <Navigate to={getSettingsPath(SettingsPath.LegalDpa)} replace />
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
        </Route>
        <Route element={<BlankLayout />}>
          <Route
            element={<OnboardingTransitionOutlet />}
            loader={preloadOnboardingPages}
          >
            <Route
              path={AppPath.SignInUp}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <SignInUp />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.Invite}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <SignInUp />
                </LazyRoute>
              }
            />
            <Route path={AppPath.Verify} element={<Verify />} />
            <Route
              path={AppPath.WorkspaceActivation}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <WorkspaceActivation />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.CreateProfile}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <CreateProfile />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.SyncEmails}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <SyncEmails />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.InstallApps}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <InstallApps />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.InviteTeam}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <InviteTeam />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.PlanRequired}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <ChooseYourPlan />
                </LazyRoute>
              }
            />
          </Route>
          <Route
            path={AppPath.Authorize}
            element={
              <LazyRoute>
                <Authorize />
              </LazyRoute>
            }
          />
        </Route>
      </Route>,
    ),
  );
