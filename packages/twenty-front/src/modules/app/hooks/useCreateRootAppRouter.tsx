import { lazy, useState } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { LazyRoute } from '@/app/components/LazyRoute';
import { RootAppProviders } from '@/app/components/RootAppProviders';
import { RootAuthorizeRedirect } from '@/app/components/RootAuthorizeRedirect';
import { VerifyEmail } from '@/auth/components/VerifyEmail';
import { OnboardingPageLoader } from '@/onboarding/components/OnboardingPageLoader';
import { OnboardingTransitionOutlet } from '@/onboarding/components/OnboardingTransitionOutlet';
import { AuthFlowLayout } from '@/ui/layout/page/components/AuthFlowLayout';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';

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

const createRootAppRouter = () =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route element={<RootAppProviders />} loader={async () => null}>
        <Route element={<BlankLayout />}>
          <Route element={<OnboardingTransitionOutlet />}>
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
          </Route>
        </Route>
        <Route element={<AuthFlowLayout />}>
          <Route path={AppPath.VerifyEmail} element={<VerifyEmail />} />
          <Route
            path={AppPath.ResetPassword}
            element={
              <LazyRoute fallback={null}>
                <PasswordReset />
              </LazyRoute>
            }
          />
        </Route>
        <Route path={AppPath.Authorize} element={<RootAuthorizeRedirect />} />
        <Route
          path={AppPath.NotFoundWildcard}
          element={<Navigate to={AppPath.SignInUp} replace />}
        />
      </Route>,
    ),
  );

export const useCreateRootAppRouter = () => {
  const [router] = useState(createRootAppRouter);

  return router;
};
