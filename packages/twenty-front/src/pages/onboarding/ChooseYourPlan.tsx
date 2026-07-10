import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { billingState } from '@/client-config/states/billingState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingStepPageLoader } from '@/onboarding/components/OnboardingStepPageLoader';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { UpgradeFreeTrial } from '~/pages/onboarding/UpgradeFreeTrial';

export const ChooseYourPlan = () => {
  const { t } = useLingui();
  const { isPlansLoaded, error } = usePlans();
  const billing = useAtomStateValue(billingState);
  const onboardingConfig = useAtomStateValue(onboardingConfigState);

  useSnackBarOnQueryError(error, t`Failed to load billing plans`);

  return isDefined(billing) && isPlansLoaded ? (
    <UpgradeFreeTrial
      billing={billing}
      creditsReward={onboardingConfig?.upgradeCreditsReward}
    />
  ) : (
    <OnboardingStepPageLoader />
  );
};
