/* @license Enterprise */

import { type BillingInvoicePaymentStatus } from 'src/engine/core-modules/billing/enums/billing-invoice-payment-status.enum';

export type OneOffInvoicePayment = {
  status: BillingInvoicePaymentStatus;
  stripeInvoiceId: string;
  stripeInvoiceNumber: string | null;
  hostedInvoiceUrl: string | null;
};
