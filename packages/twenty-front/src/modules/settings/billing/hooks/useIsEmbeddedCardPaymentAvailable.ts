import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useIsEmbeddedCardPaymentAvailable = () => {
  const publishableKey = useAtomStateValue(billingState)?.stripePublishableKey;

  return isDefined(publishableKey) && publishableKey !== '';
};
