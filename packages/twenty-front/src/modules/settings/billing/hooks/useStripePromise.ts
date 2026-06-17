import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Loads the Stripe.js instance from the publishable key exposed in the client
// config. Returns null when billing is not configured with a publishable key.
export const useStripePromise = (): Promise<Stripe | null> | null => {
  const billing = useAtomStateValue(billingState);
  const publishableKey = billing?.stripePublishableKey;

  return useMemo(
    () =>
      isDefined(publishableKey) && publishableKey !== ''
        ? loadStripe(publishableKey)
        : null,
    [publishableKey],
  );
};
