import { type Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { isDefined } from 'twenty-shared/utils';

const stripePromiseByKey = new Map<string, Promise<Stripe | null>>();

export const getStripePromise = (
  publishableKey: string,
): Promise<Stripe | null> => {
  const existingPromise = stripePromiseByKey.get(publishableKey);

  if (isDefined(existingPromise)) {
    return existingPromise;
  }

  const stripePromise = loadStripe(publishableKey);

  stripePromiseByKey.set(publishableKey, stripePromise);

  // Drop failed loads so a later call can retry
  stripePromise.catch(() => {
    stripePromiseByKey.delete(publishableKey);
  });

  return stripePromise;
};
