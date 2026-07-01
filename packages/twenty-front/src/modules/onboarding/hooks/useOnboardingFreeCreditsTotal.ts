import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useOnboardingFreeCreditsTotal = () => {
  const onboardingFreeCredits = useAtomStateValue(onboardingFreeCreditsState);

  return (
    onboardingFreeCredits.importContacts +
    onboardingFreeCredits.inviteTeam +
    onboardingFreeCredits.installApps
  );
};
