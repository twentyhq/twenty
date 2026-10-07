/* @license Enterprise */

import type Stripe from 'stripe';

import { BillingInvoicePaymentStatus } from 'src/engine/core-modules/billing/enums/billing-invoice-payment-status.enum';
import { type OneOffInvoicePayment } from 'src/engine/core-modules/billing/types/one-off-invoice-payment.type';

export const toOneOffInvoicePayment = ({
  invoice,
  status,
}: {
  invoice: Stripe.Invoice;
  status: BillingInvoicePaymentStatus;
}): OneOffInvoicePayment => ({
  status,
  stripeInvoiceId: invoice.id,
  stripeInvoiceNumber: invoice.number,
  hostedInvoiceUrl:
    status === BillingInvoicePaymentStatus.REQUIRES_ACTION
      ? (invoice.hosted_invoice_url ?? null)
      : null,
});
