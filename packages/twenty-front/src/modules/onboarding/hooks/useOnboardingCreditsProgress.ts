import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useIsPlanRequired } from '@/onboarding/hooks/useIsPlanRequired';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { getOnboardingCreditsProgress } from '@/onboarding/utils/getOnboardingCreditsProgress';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useOnboardingCreditsProgress = () => {
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const onboardingFreeCredits = useAtomFamilyStateValue(
    onboardingFreeCreditsFamilyState,
    currentWorkspace?.id ?? '',
  );
  const currentUser = useAtomStateValue(currentUserState);
  const isPlanRequired = useIsPlanRequired();

  if (!isDefined(onboardingConfig)) {
    return null;
  }

  return getOnboardingCreditsProgress({
    onboardingFreeCredits,
    onboardingConfig,
    onboardingStatus: currentUser?.onboardingStatus,
    isWorkspaceCreator: currentUser?.isWorkspaceCreator ?? false,
    isPlanRequired,
  });
};
