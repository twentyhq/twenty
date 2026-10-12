import { shouldSetPendingInvoiceItemInterval } from 'src/engine/core-modules/billing-webhook/utils/should-set-pending-invoice-item-interval.util';

describe('shouldSetPendingInvoiceItemInterval', () => {
  it('is true for an active invoice-paying subscription without an interval', () => {
    expect(
      shouldSetPendingInvoiceItemInterval({
        collection_method: 'send_invoice',
        pending_invoice_item_interval: null,
        status: 'active',
      }),
    ).toBe(true);
  });

  it('is true for an invoice-paying subscription still in trial', () => {
    expect(
      shouldSetPendingInvoiceItemInterval({
        collection_method: 'send_invoice',
        pending_invoice_item_interval: null,
        status: 'trialing',
      }),
    ).toBe(true);
  });

  it('keeps an interval already set on the subscription', () => {
    expect(
      shouldSetPendingInvoiceItemInterval({
        collection_method: 'send_invoice',
        pending_invoice_item_interval: {
          interval: 'month',
          interval_count: 3,
        },
        status: 'active',
      }),
    ).toBe(false);
  });

  it('is false for card-paying subscriptions', () => {
    expect(
      shouldSetPendingInvoiceItemInterval({
        collection_method: 'charge_automatically',
        pending_invoice_item_interval: null,
        status: 'active',
      }),
    ).toBe(false);
  });

  it('is false for canceled subscriptions', () => {
    expect(
      shouldSetPendingInvoiceItemInterval({
        collection_method: 'send_invoice',
        pending_invoice_item_interval: null,
        status: 'canceled',
      }),
    ).toBe(false);
  });
});
