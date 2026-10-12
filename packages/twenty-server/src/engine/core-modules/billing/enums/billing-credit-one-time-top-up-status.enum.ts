/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingCreditOneTimeTopUpStatus {
  ADDED_TO_NEXT_INVOICE = 'ADDED_TO_NEXT_INVOICE',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
}

registerEnumType(BillingCreditOneTimeTopUpStatus, {
  name: 'BillingCreditOneTimeTopUpStatus',
  description: 'Where a one-time credit top-up stands',
});
