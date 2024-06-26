import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useWorkspaceHasSubscription } from '@/workspace/hooks/useWorkspaceHasSubscription';
import { OnboardingStatus, SubscriptionStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const useShowAuthModal = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const onboardingStatus = useOnboardingStatus();
  const subscriptionStatus = useSubscriptionStatus();
  const workspaceHasSubscription = useWorkspaceHasSubscription();
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
        (onboardingStatus === OnboardingStatus.Completed &&
          !workspaceHasSubscription) ||
        subscriptionStatus === SubscriptionStatus.Canceled
      );
    }
    return false;
  }, [
    isDefaultLayoutAuthModalVisible,
    isMatchingLocation,
    workspaceHasSubscription,
    onboardingStatus,
    subscriptionStatus,
  ]);
};
