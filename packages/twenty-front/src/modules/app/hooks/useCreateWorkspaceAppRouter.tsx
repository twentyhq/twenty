import { lazy, useMemo } from 'react';

import { createBrowserRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { LazyRoute } from '@/app/components/LazyRoute';
import { WorkspaceAppProviders } from '@/app/components/WorkspaceAppProviders';
import { WorkspaceRouteObjectsProvider } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { createWorkspaceRouteObjects } from '@/app/routing/utils/createWorkspaceRouteObjects';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { VerifyEmail } from '@/auth/components/VerifyEmail';
import { MinimalMetadataGate } from '@/metadata-store/components/MinimalMetadataGate';
import { OnboardingActivationOutlet } from '@/onboarding/components/OnboardingActivationOutlet';
import { OnboardingPageLoader } from '@/onboarding/components/OnboardingPageLoader';
import { OnboardingStepLayout } from '@/onboarding/components/OnboardingStepLayout';
import { OnboardingStepPageLoader } from '@/onboarding/components/OnboardingStepPageLoader';
import { OnboardingTransitionOutlet } from '@/onboarding/components/OnboardingTransitionOutlet';
import { AuthFlowLayout } from '@/ui/layout/page/components/AuthFlowLayout';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import { MainAppLayoutWithSidePanel } from '@/ui/layout/page/components/MainAppLayoutWithSidePanel';
import { Verify } from '~/pages/onboarding/Verify';
import { lazyWithPreload } from '~/utils/lazyWithPreload';

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

const BookCall = lazyWithPreload(() =>
  import('~/pages/onboarding/BookCall').then((module) => ({
    default: module.BookCall,
  })),
);

const preloadOnboardingPages = () => {
  WorkspaceActivation.preload();
  CreateProfile.preload();
  SyncEmails.preload();
  InstallApps.preload();
  InviteTeam.preload();
  BookCall.preload();
  ChooseYourPlan.preload();

  return null;
};

type CreateWorkspaceAppRouterArgs = {
  isAdminPageEnabled?: boolean;
  isWorkflowCoreIndexPageEnabled?: boolean;
};

const createWorkspaceAppRouter = ({
  isAdminPageEnabled,
  isWorkflowCoreIndexPageEnabled,
}: CreateWorkspaceAppRouterArgs) => {
  const workspaceRouteObjects = createWorkspaceRouteObjects({
    isAdminPageEnabled,
    isWorkflowCoreIndexPageEnabled,
  });

  return createBrowserRouter([
    {
      element: (
        <WorkspaceRouteObjectsProvider routeObjects={workspaceRouteObjects} />
      ),
      children: [
        {
          element: <WorkspaceAppProviders />,
          loader: async () => Promise.resolve(null),
          children: [
            {
              element: <MinimalMetadataGate />,
              children: [
                {
                  element: <DefaultLayout />,
                  children: [
                    {
                      element: <MainAppLayoutWithSidePanel />,
                      children: getWorkspaceRouteObjectsForSurface(
                        workspaceRouteObjects,
                        'main',
                      ),
                    },
                  ],
                },
              ],
            },
            {
              element: <AuthFlowLayout />,
              children: [
                { path: AppPath.VerifyEmail, element: <VerifyEmail /> },
                {
                  path: AppPath.ResetPassword,
                  element: (
                    <LazyRoute fallback={null}>
                      <PasswordReset />
                    </LazyRoute>
                  ),
                },
                {
                  path: AppPath.PlanRequiredSuccess,
                  element: (
                    <LazyRoute fallback={<OnboardingPageLoader />}>
                      <PaymentSuccess />
                    </LazyRoute>
                  ),
                },
              ],
            },
            {
              element: <BlankLayout />,
              children: [
                {
                  element: <OnboardingTransitionOutlet />,
                  loader: preloadOnboardingPages,
                  children: [
                    {
                      path: AppPath.SignInUp,
                      element: (
                        <LazyRoute fallback={<OnboardingPageLoader />}>
                          <SignInUp />
                        </LazyRoute>
                      ),
                    },
                    {
                      path: AppPath.Invite,
                      element: (
                        <LazyRoute fallback={<OnboardingPageLoader />}>
                          <SignInUp />
                        </LazyRoute>
                      ),
                    },
                  ],
                },
                {
                  element: <OnboardingActivationOutlet />,
                  loader: preloadOnboardingPages,
                  children: [
                    { path: AppPath.Verify, element: <Verify /> },
                    {
                      path: AppPath.WorkspaceActivation,
                      element: (
                        <LazyRoute fallback={null}>
                          <WorkspaceActivation />
                        </LazyRoute>
                      ),
                    },
                  ],
                },
                {
                  element: <OnboardingStepLayout />,
                  loader: preloadOnboardingPages,
                  children: [
                    {
                      path: AppPath.CreateProfile,
                      element: (
                        <LazyRoute fallback={<OnboardingStepPageLoader />}>
                          <CreateProfile />
                        </LazyRoute>
                      ),
                    },
                    {
                      path: AppPath.SyncEmails,
                      element: (
                        <LazyRoute fallback={<OnboardingStepPageLoader />}>
                          <SyncEmails />
                        </LazyRoute>
                      ),
                    },
                    {
                      path: AppPath.InstallApps,
                      element: (
                        <LazyRoute fallback={<OnboardingStepPageLoader />}>
                          <InstallApps />
                        </LazyRoute>
                      ),
                    },
                    {
                      path: AppPath.InviteTeam,
                      element: (
                        <LazyRoute fallback={<OnboardingStepPageLoader />}>
                          <InviteTeam />
                        </LazyRoute>
                      ),
                    },
                    {
                      path: AppPath.BookCall,
                      element: (
                        <LazyRoute fallback={<OnboardingStepPageLoader />}>
                          <BookCall />
                        </LazyRoute>
                      ),
                    },
                    {
                      path: AppPath.PlanRequired,
                      element: (
                        <LazyRoute fallback={<OnboardingStepPageLoader />}>
                          <ChooseYourPlan />
                        </LazyRoute>
                      ),
                    },
                  ],
                },
                {
                  path: AppPath.Authorize,
                  element: (
                    <LazyRoute>
                      <Authorize />
                    </LazyRoute>
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
};

export const useCreateWorkspaceAppRouter = ({
  isAdminPageEnabled,
  isWorkflowCoreIndexPageEnabled,
}: CreateWorkspaceAppRouterArgs) =>
  useMemo(
    () =>
      createWorkspaceAppRouter({
        isAdminPageEnabled,
        isWorkflowCoreIndexPageEnabled,
      }),
    [isAdminPageEnabled, isWorkflowCoreIndexPageEnabled],
  );
