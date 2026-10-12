import { isSendInvoiceBillingSubscription } from '@/settings/billing/utils/isSendInvoiceBillingSubscription';
import { BillingSubscriptionCollectionMethod } from '~/generated-metadata/graphql';

describe('isSendInvoiceBillingSubscription', () => {
  it('is true for subscriptions paid by emailed invoice', () => {
    expect(
      isSendInvoiceBillingSubscription(
        BillingSubscriptionCollectionMethod.SEND_INVOICE,
      ),
    ).toBe(true);
  });

  it('is false for subscriptions charged automatically', () => {
    expect(
      isSendInvoiceBillingSubscription(
        BillingSubscriptionCollectionMethod.CHARGE_AUTOMATICALLY,
      ),
    ).toBe(false);
  });

  it('is false when the collection method is unknown', () => {
    expect(isSendInvoiceBillingSubscription(undefined)).toBe(false);
  });
});
