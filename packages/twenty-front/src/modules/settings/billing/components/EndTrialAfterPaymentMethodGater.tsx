import { billingState } from '@/client-config/states/billingState';
import { START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM } from '@/settings/billing/constants/StartSubscriptionAfterPaymentMethodQueryParam';
import { EndTrialAfterPaymentMethodEffect } from '@/settings/billing/effect-components/EndTrialAfterPaymentMethodEffect';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSearchParams } from 'react-router-dom';


export const EndTrialAfterPaymentMethodGater = () => {
  const billing = useAtomStateValue(billingState);
  const [searchParams] = useSearchParams();

  const shouldRun =
    (billing?.isBillingEnabled ?? false) &&
    searchParams.has(START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM);

  if (!shouldRun) {
    return null;
  }

  return <EndTrialAfterPaymentMethodEffect />;
};
