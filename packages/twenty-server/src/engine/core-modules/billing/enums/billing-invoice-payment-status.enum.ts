/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingInvoicePaymentStatus {
  ADDED_TO_NEXT_INVOICE = 'ADDED_TO_NEXT_INVOICE',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
}

registerEnumType(BillingInvoicePaymentStatus, {
  name: 'BillingInvoicePaymentStatus',
  description: 'Where the payment of a one-time purchase stands',
});
