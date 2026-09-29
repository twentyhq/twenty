import { currentUserState } from '@/auth/states/currentUserState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useIsPlanRequired } from '@/onboarding/hooks/useIsPlanRequired';
import { currentWorkspaceOnboardingFreeCreditsSelector } from '@/onboarding/states/selectors/currentWorkspaceOnboardingFreeCreditsSelector';
import { getOnboardingCreditsProgress } from '@/onboarding/utils/getOnboardingCreditsProgress';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useOnboardingCreditsProgress = () => {
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const currentWorkspaceOnboardingFreeCredits = useAtomStateValue(
    currentWorkspaceOnboardingFreeCreditsSelector,
  );
  const currentUser = useAtomStateValue(currentUserState);
  const isPlanRequired = useIsPlanRequired();

  if (!isDefined(onboardingConfig)) {
    return null;
  }

  return getOnboardingCreditsProgress({
    onboardingFreeCredits: currentWorkspaceOnboardingFreeCredits,
    onboardingConfig,
    onboardingStatus: currentUser?.onboardingStatus,
    isWorkspaceCreator: currentUser?.isWorkspaceCreator ?? false,
    isPlanRequired,
  });
};
