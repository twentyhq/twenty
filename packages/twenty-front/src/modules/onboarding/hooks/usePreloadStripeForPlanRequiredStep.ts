import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { getStripePromise } from '@/settings/billing/hooks/useStripePromise';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Warms up Stripe.js from the onboarding steps preceding the plan-required
// step, so the payment form does not wait for the script download there
export const usePreloadStripeForPlanRequiredStep = () => {
  const billing = useAtomStateValue(billingState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isPlanRequiredStepUpcoming =
    (billing?.isBillingEnabled ?? false) &&
    (currentWorkspace?.billingSubscriptions?.length ?? 0) === 0;

  const publishableKey = billing?.stripePublishableKey;

  useEffect(() => {
    if (isPlanRequiredStepUpcoming && isNonEmptyString(publishableKey)) {
      void getStripePromise(publishableKey);
    }
  }, [isPlanRequiredStepUpcoming, publishableKey]);
};
