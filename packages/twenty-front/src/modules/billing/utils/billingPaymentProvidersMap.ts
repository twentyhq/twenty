import { t } from '@lingui/core/macro';
import { BillingPaymentProviders } from '~/generated/graphql';

/**
 * Key-value map for billing payment providers and their labels.
 */
export const billingPaymentProvidersMap: Record<
  BillingPaymentProviders,
  string
> = {
  [BillingPaymentProviders.Stripe]: t`Cartão de crédito`,
  [BillingPaymentProviders.Inter]: t`Boleto`,
};
