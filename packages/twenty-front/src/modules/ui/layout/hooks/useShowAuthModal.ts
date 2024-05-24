import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
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
      OnboardingStatus.Incomplete === onboardingStatus ||
      OnboardingStatus.OngoingUserCreation === onboardingStatus ||
      OnboardingStatus.OngoingProfileCreation === onboardingStatus ||
      OnboardingStatus.OngoingWorkspaceActivation === onboardingStatus
    ) {
      return true;
    }
    if (isMatchingLocation(AppPath.PlanRequired)) {
      return (
        OnboardingStatus.CompletedWithoutSubscription === onboardingStatus ||
        OnboardingStatus.Canceled === onboardingStatus
      );
    }
    return false;
  }, [isDefaultLayoutAuthModalVisible, isMatchingLocation, onboardingStatus]);
};
