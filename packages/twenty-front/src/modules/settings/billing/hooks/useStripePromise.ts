import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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

  // A failed script load (e.g. while preloading on a flaky network) must not
  // be cached, so the payment step can retry
  stripePromise.catch(() => {
    stripePromiseByKey.delete(publishableKey);
  });

  return stripePromise;
};

export const useStripePromise = (): Promise<Stripe | null> | null => {
  const billing = useAtomStateValue(billingState);
  const publishableKey = billing?.stripePublishableKey;

  return isDefined(publishableKey) && publishableKey !== ''
    ? getStripePromise(publishableKey)
    : null;
};
