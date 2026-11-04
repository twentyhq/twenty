/* @license Enterprise */

import { type BillingArrangementSettingKey } from 'src/engine/core-modules/billing/types/billing-arrangement-setting-key.type';

export type BillingArrangementValidationError =
  | { code: 'MISSING_SETTING'; setting: BillingArrangementSettingKey }
  | { code: 'UNEXPECTED_SETTING'; setting: BillingArrangementSettingKey }
  | { code: 'INVALID_SEATS' }
  | { code: 'INVALID_CREDIT_ALLOWANCE' }
  | { code: 'COMMENT_TOO_LONG' }
  | { code: 'INVALID_DATE' }
  | { code: 'ENDS_BEFORE_START' };
