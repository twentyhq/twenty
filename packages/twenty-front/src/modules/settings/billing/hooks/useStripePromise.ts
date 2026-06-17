import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { isDefined } from 'twenty-shared/utils';

// Cache the Stripe.js instance per publishable key at module scope so the SDK
// loads once per page session rather than on every mount of the payment form.
const stripePromiseByKey = new Map<string, Promise<Stripe | null>>();

const getStripePromise = (publishableKey: string): Promise<Stripe | null> => {
  const existingPromise = stripePromiseByKey.get(publishableKey);

  if (isDefined(existingPromise)) {
    return existingPromise;
  }

  const stripePromise = loadStripe(publishableKey);

  stripePromiseByKey.set(publishableKey, stripePromise);

  return stripePromise;
};

export const useStripePromise = (): Promise<Stripe | null> | null => {
  const billing = useAtomStateValue(billingState);
  const publishableKey = billing?.stripePublishableKey;

  return isDefined(publishableKey) && publishableKey !== ''
    ? getStripePromise(publishableKey)
    : null;
};
