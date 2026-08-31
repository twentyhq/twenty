import { lazy, useMemo } from 'react';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { LazyRoute } from '@/app/components/LazyRoute';
import { WorkspaceAppProviders } from '@/app/components/WorkspaceAppProviders';
import { WorkspaceRouteObjectsProvider } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { createWorkspaceRouteObjects } from '@/app/routing/utils/createWorkspaceRouteObjects';
import { getWorkspaceRouteElementsForSurface } from '@/app/routing/utils/getWorkspaceRouteElementsForSurface';
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

  return createBrowserRouter(
    createRoutesFromElements(
      <Route
        element={
          <WorkspaceRouteObjectsProvider routeObjects={workspaceRouteObjects} />
        }
      >
        <Route
          element={<WorkspaceAppProviders />}
          loader={async () => Promise.resolve(null)}
        >
          <Route element={<MinimalMetadataGate />}>
            <Route element={<DefaultLayout />}>
              <Route element={<MainAppLayoutWithSidePanel />}>
                {getWorkspaceRouteElementsForSurface(
                  workspaceRouteObjects,
                  'main',
                )}
              </Route>
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
            <Route
              path={AppPath.PlanRequiredSuccess}
              element={
                <LazyRoute fallback={<OnboardingPageLoader />}>
                  <PaymentSuccess />
                </LazyRoute>
              }
            />
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
            </Route>
            <Route
              element={<OnboardingActivationOutlet />}
              loader={preloadOnboardingPages}
            >
              <Route path={AppPath.Verify} element={<Verify />} />
              <Route
                path={AppPath.WorkspaceActivation}
                element={
                  <LazyRoute fallback={null}>
                    <WorkspaceActivation />
                  </LazyRoute>
                }
              />
            </Route>
            <Route
              element={<OnboardingStepLayout />}
              loader={preloadOnboardingPages}
            >
              <Route
                path={AppPath.CreateProfile}
                element={
                  <LazyRoute fallback={<OnboardingStepPageLoader />}>
                    <CreateProfile />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.SyncEmails}
                element={
                  <LazyRoute fallback={<OnboardingStepPageLoader />}>
                    <SyncEmails />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.InstallApps}
                element={
                  <LazyRoute fallback={<OnboardingStepPageLoader />}>
                    <InstallApps />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.InviteTeam}
                element={
                  <LazyRoute fallback={<OnboardingStepPageLoader />}>
                    <InviteTeam />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.BookCall}
                element={
                  <LazyRoute fallback={<OnboardingStepPageLoader />}>
                    <BookCall />
                  </LazyRoute>
                }
              />
              <Route
                path={AppPath.PlanRequired}
                element={
                  <LazyRoute fallback={<OnboardingStepPageLoader />}>
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
        </Route>
      </Route>,
    ),
  );
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
