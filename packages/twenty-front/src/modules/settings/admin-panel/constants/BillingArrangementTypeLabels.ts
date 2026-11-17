import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { BillingArrangementType } from '~/generated-admin/graphql';

export const BILLING_ARRANGEMENT_TYPE_LABELS: Record<
  BillingArrangementType,
  MessageDescriptor
> = {
  [BillingArrangementType.COMMITTED_SEATS]: msg`Committed seats`,
  [BillingArrangementType.FREE_SEATS]: msg`Free seats`,
  [BillingArrangementType.DISCOUNT]: msg`Discount`,
  [BillingArrangementType.TRIAL_EXTENSION]: msg`Trial extension`,
  [BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE]: msg`Credit allowance`,
  [BillingArrangementType.LIMIT_OVERRIDE]: msg`Limit override`,
  [BillingArrangementType.REFUND]: msg`Refund`,
  [BillingArrangementType.CREDIT_GRANT]: msg`Credit grant`,
};
