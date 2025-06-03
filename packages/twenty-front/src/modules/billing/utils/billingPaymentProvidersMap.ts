import { msg } from '@lingui/core/macro';
import { BillingPaymentProviders } from '~/generated/graphql';

/**
 * Key-value map for billing payment providers and their labels.
 */
export const billingPaymentProvidersMap = {
  [BillingPaymentProviders.Stripe]: msg`Cartão de crédito`,
  [BillingPaymentProviders.Inter]: msg`Boleto`,
};
