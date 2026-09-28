import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useRecomputeInviteTeamFreeCredits } from '@/onboarding/hooks/useRecomputeInviteTeamFreeCredits';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const InviteTeamCreditsEffect = () => {
  const isOnboardingConfigLoaded = isDefined(
    useAtomStateValue(onboardingConfigState),
  );
  const recomputeInviteTeamFreeCredits = useRecomputeInviteTeamFreeCredits();

  useEffect(() => {
    recomputeInviteTeamFreeCredits();
  }, [isOnboardingConfigLoaded, recomputeInviteTeamFreeCredits]);

  return null;
};
