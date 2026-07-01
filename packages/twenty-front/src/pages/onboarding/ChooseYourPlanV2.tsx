import { billingState } from '@/client-config/states/billingState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
import { useOnboardingFreeCreditsTotal } from '@/onboarding/hooks/useOnboardingFreeCreditsTotal';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { UpgradeFreeTrial } from '~/pages/onboarding/UpgradeFreeTrial';

const StyledPlaceholder = styled.div`
  flex: 1 1 0;
`;

export const ChooseYourPlanV2 = () => {
  const { isPlansLoaded } = usePlans();
  const billing = useAtomStateValue(billingState);
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const freeCreditsTotal = useOnboardingFreeCreditsTotal();

  return (
    <OnboardingV2Layout freeCredits={freeCreditsTotal}>
      {isDefined(billing) && isPlansLoaded ? (
        <UpgradeFreeTrial
          billing={billing}
          creditsReward={onboardingConfig?.upgradeCreditsReward}
        />
      ) : (
        <StyledPlaceholder />
      )}
    </OnboardingV2Layout>
  );
};
