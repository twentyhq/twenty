import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { OnboardingStep } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { isDefined } from '~/utils/isDefined';

export const useShowAuthModal = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const onboardingStatus = useOnboardingStatus();
  const isDefaultLayoutAuthModalVisible = useRecoilValue(
    isDefaultLayoutAuthModalVisibleState,
  );
  return useMemo(() => {
    if (isMatchingLocation(AppPath.Verify)) {
      return false;
    }
    if (
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.ResetPassword)
    ) {
      return isDefaultLayoutAuthModalVisible;
    }
    if (
      isDefined(onboardingStatus) &&
      [
        OnboardingStep.SubscriptionIncomplete,
        OnboardingStep.UserCreation,
        OnboardingStep.ProfileCreation,
        OnboardingStep.WorkspaceActivation,
        OnboardingStep.SyncEmail,
        OnboardingStep.InviteTeam,
      ].includes(onboardingStatus)
    ) {
      return true;
    }
    if (isMatchingLocation(AppPath.PlanRequired)) {
      return (
        isDefined(onboardingStatus) &&
        [
          OnboardingStep.CompletedWithoutSubscription,
          OnboardingStep.SubscriptionCanceled,
        ].includes(onboardingStatus)
      );
    }
    return false;
  }, [isDefaultLayoutAuthModalVisible, isMatchingLocation, onboardingStatus]);
};
