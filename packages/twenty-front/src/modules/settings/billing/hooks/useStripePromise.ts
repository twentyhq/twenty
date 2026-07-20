import { billingState } from '@/client-config/states/billingState';
import { getStripePromise } from '@/settings/billing/utils/getStripePromise';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { type Stripe } from '@stripe/stripe-js';

export const useStripePromise = (): Promise<Stripe | null> | null => {
  const billing = useAtomStateValue(billingState);
  const publishableKey = billing?.stripePublishableKey;

  return isNonEmptyString(publishableKey)
    ? getStripePromise(publishableKey)
    : null;
};
