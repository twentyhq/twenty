/* @license Enterprise */

import { CustomException } from 'src/utils/custom-exception';

export class BillingException extends CustomException {
  code: BillingExceptionCode;
  constructor(message: string, code: BillingExceptionCode) {
    super(message, code);
  }
}

export enum BillingExceptionCode {
  BILLING_CUSTOMER_NOT_FOUND = 'BILLING_CUSTOMER_NOT_FOUND',
  BILLING_PRODUCT_NOT_FOUND = 'BILLING_PRODUCT_NOT_FOUND',
  BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND = 'BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND',
}
