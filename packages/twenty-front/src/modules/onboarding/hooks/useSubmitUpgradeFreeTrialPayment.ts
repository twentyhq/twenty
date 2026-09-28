import { useSetOnboardingUpgradeTrialFreeCredits } from '@/onboarding/hooks/useSetOnboardingUpgradeTrialFreeCredits';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { useSubmitSubscriptionPayment } from '@/settings/billing/hooks/useSubmitSubscriptionPayment';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

type UseSubmitUpgradeFreeTrialPaymentParams = {
  plan: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
};

export const useSubmitUpgradeFreeTrialPayment = ({
  plan,
  recurringInterval,
}: UseSubmitUpgradeFreeTrialPaymentParams) => {
  const { submit, isSubmitting, isStripeReady } = useSubmitSubscriptionPayment({
    plan,
    recurringInterval,
  });

  const setIsOnboardingCheckoutPending = useSetAtomState(
    isOnboardingCheckoutPendingState,
  );
  const setOnboardingUpgradeTrialFreeCredits =
    useSetOnboardingUpgradeTrialFreeCredits();

  const handleSubmit = () => {
    setOnboardingUpgradeTrialFreeCredits(true);
    setIsOnboardingCheckoutPending(true);
    void submit();
  };

  return { handleSubmit, isSubmitting, isStripeReady };
};
