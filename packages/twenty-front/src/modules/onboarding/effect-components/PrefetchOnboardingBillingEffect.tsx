import { billingState } from '@/client-config/states/billingState';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const PrefetchOnboardingBillingEffect = () => {
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  usePlans({ skip: !isBillingEnabled });

  return null;
};
