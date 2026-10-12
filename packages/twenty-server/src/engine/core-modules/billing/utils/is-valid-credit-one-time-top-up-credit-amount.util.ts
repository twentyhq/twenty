/* @license Enterprise */

import { CREDIT_ONE_TIME_TOP_UP_CREDIT_AMOUNT_RANGE } from 'src/engine/core-modules/billing/constants/credit-one-time-top-up-credit-amount-range.constant';

export const isValidCreditOneTimeTopUpCreditAmount = (
  creditAmount: number,
): boolean =>
  Number.isInteger(creditAmount) &&
  creditAmount >= CREDIT_ONE_TIME_TOP_UP_CREDIT_AMOUNT_RANGE.minimum &&
  creditAmount <= CREDIT_ONE_TIME_TOP_UP_CREDIT_AMOUNT_RANGE.maximum;
