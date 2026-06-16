import { billingState } from '@/client-config/states/billingState';
import { START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM } from '@/settings/billing/constants/StartSubscriptionAfterPaymentMethodQueryParam';
import { EndTrialAfterPaymentMethodEffect } from '@/settings/billing/effect-components/EndTrialAfterPaymentMethodEffect';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSearchParams } from 'react-router-dom';

// Cheap, always-mounted guard. It only reads the billing config atom and the
// URL search params, and renders the (hook-heavy) effect exclusively when the
// user is returning from the Stripe payment-method-update portal.
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
