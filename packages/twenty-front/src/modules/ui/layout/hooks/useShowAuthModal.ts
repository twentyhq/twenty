import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { OnboardingStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

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
      !onboardingStatus ||
      onboardingStatus === OnboardingStatus.PlanRequired ||
      onboardingStatus === OnboardingStatus.ProfileCreation ||
      onboardingStatus === OnboardingStatus.WorkspaceActivation ||
      onboardingStatus === OnboardingStatus.SyncEmail ||
      onboardingStatus === OnboardingStatus.InviteTeam
    ) {
      return true;
    }
    if (isMatchingLocation(AppPath.PlanRequired)) {
      return (
        onboardingStatus === OnboardingStatus.CompletedWithoutSubscription ||
        onboardingStatus === OnboardingStatus.SubscriptionCanceled
      );
    }
    return false;
  }, [isDefaultLayoutAuthModalVisible, isMatchingLocation, onboardingStatus]);
};
