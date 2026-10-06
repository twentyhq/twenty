/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingInvoicePaymentStatus {
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
}

registerEnumType(BillingInvoicePaymentStatus, {
  name: 'BillingInvoicePaymentStatus',
  description: 'Where the payment of a one-off invoice stands',
});
