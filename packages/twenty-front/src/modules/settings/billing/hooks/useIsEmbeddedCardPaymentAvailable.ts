import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

// The embedded Stripe Payment Element needs a publishable key. Instances that
// run billing through the Stripe portal only (no publishable key configured)
// must keep the redirect flow instead of dead-ending in the embedded modal.
export const useIsEmbeddedCardPaymentAvailable = () => {
  const publishableKey = useAtomStateValue(billingState)?.stripePublishableKey;

  return isDefined(publishableKey) && publishableKey !== '';
};
