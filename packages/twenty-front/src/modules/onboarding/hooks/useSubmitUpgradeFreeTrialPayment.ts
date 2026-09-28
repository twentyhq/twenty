import { useSetOnboardingUpgradeTrialFreeCredits } from '@/onboarding/hooks/useSetOnboardingUpgradeTrialFreeCredits';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { isUpgradeFreeTrialPaymentSubmittingState } from '@/onboarding/states/isUpgradeFreeTrialPaymentSubmittingState';
import { useSubmitSubscriptionPayment } from '@/settings/billing/hooks/useSubmitSubscriptionPayment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
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
  const store = useStore();
  const { submit, isStripeReady } = useSubmitSubscriptionPayment({
    plan,
    recurringInterval,
  });
  const isUpgradeFreeTrialPaymentSubmitting = useAtomStateValue(
    isUpgradeFreeTrialPaymentSubmittingState,
  );
  const setOnboardingUpgradeTrialFreeCredits =
    useSetOnboardingUpgradeTrialFreeCredits();

  const handleSubmit = async () => {
    if (store.get(isUpgradeFreeTrialPaymentSubmittingState.atom)) {
      return;
    }

    setOnboardingUpgradeTrialFreeCredits(true);
    store.set(isUpgradeFreeTrialPaymentSubmittingState.atom, true);
    store.set(isOnboardingCheckoutPendingState.atom, true);

    await submit();

    store.set(isUpgradeFreeTrialPaymentSubmittingState.atom, false);
  };

  return {
    handleSubmit,
    isSubmitting: isUpgradeFreeTrialPaymentSubmitting,
    isStripeReady,
  };
};
