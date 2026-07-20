import { billingState } from '@/client-config/states/billingState';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { useStripePromise } from '@/settings/billing/hooks/useStripePromise';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const PrefetchOnboardingBillingEffect = () => {
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  usePlans({ skip: !isBillingEnabled });
  useStripePromise();

  return null;
};
