import { useMemo } from 'react';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { OnboardingStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const useShowAuthModal = () => {
  const { isMatchingLocation } = useIsMatchingLocation();
  const isLoggedIn = useIsLogged();
  const onboardingStatus = useOnboardingStatus();

  return useMemo(() => {
    if (
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.ResetPassword) ||
      isMatchingLocation(AppPath.VerifyEmail) ||
      isMatchingLocation(AppPath.Verify) ||
      isMatchingLocation(AppPath.SignInUp) ||
      isMatchingLocation(AppPath.CreateWorkspace) ||
      isMatchingLocation(AppPath.PlanRequired)
    ) {
      return true;
    }

    if (
      !isLoggedIn ||
      onboardingStatus === OnboardingStatus.PLAN_REQUIRED ||
      onboardingStatus === OnboardingStatus.PROFILE_CREATION ||
      onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION ||
      onboardingStatus === OnboardingStatus.SYNC_EMAIL ||
      onboardingStatus === OnboardingStatus.INVITE_TEAM
    ) {
      return true;
    }

    return false;
  }, [isLoggedIn, isMatchingLocation, onboardingStatus]);
};
