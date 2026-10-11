import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { isSendInvoiceSubscription } from 'src/engine/core-modules/billing/utils/is-send-invoice-subscription.util';

describe('isSendInvoiceSubscription', () => {
  it('is true for subscriptions paid by emailed invoice', () => {
    expect(
      isSendInvoiceSubscription({
        collectionMethod: BillingSubscriptionCollectionMethod.SEND_INVOICE,
      }),
    ).toBe(true);
  });

  it('is false for subscriptions charged automatically', () => {
    expect(
      isSendInvoiceSubscription({
        collectionMethod:
          BillingSubscriptionCollectionMethod.CHARGE_AUTOMATICALLY,
      }),
    ).toBe(false);
  });
});
