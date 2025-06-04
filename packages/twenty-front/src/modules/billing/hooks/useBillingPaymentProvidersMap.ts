import { useLingui } from '@lingui/react/macro';
import { BillingPaymentProviders } from '~/generated/graphql';

export const useBillingPaymentProvidersMap = () => {
  const { t } = useLingui();

  /**
   * Key-value map for billing payment providers and their labels.
   */
  const billingPaymentProvidersMap = {
    [BillingPaymentProviders.Stripe]: t`Cartão de crédito`,
    [BillingPaymentProviders.Inter]: t`Boleto`,
  };
  return { billingPaymentProvidersMap };
};
