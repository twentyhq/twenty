import { billingState } from '@/client-config/states/billingState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingStepPageLoader } from '@/onboarding/components/OnboardingStepPageLoader';
import { ChooseYourPlanErrorState } from '@/onboarding/components/upgrade-free-trial/ChooseYourPlanErrorState';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { UpgradeFreeTrial } from '~/pages/onboarding/UpgradeFreeTrial';

export const ChooseYourPlan = () => {
  const { isPlansLoaded, error, refetch } = usePlans();
  const billing = useAtomStateValue(billingState);
  const onboardingConfig = useAtomStateValue(onboardingConfigState);

  if (isDefined(billing) && isPlansLoaded) {
    return (
      <UpgradeFreeTrial
        billing={billing}
        creditsReward={onboardingConfig?.upgradeCreditsReward}
      />
    );
  }

  if (isDefined(error)) {
    return <ChooseYourPlanErrorState onRetry={() => void refetch()} />;
  }

  return <OnboardingStepPageLoader />;
};
