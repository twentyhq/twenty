import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { BillingArrangementLabel } from '~/generated-admin/graphql';

export const BILLING_ARRANGEMENT_REASON_LABELS: Record<
  BillingArrangementLabel,
  MessageDescriptor
> = {
  [BillingArrangementLabel.APP_OWNER_WORKSPACE]: msg`App owner workspace`,
  [BillingArrangementLabel.COMPENSATION]: msg`Compensation`,
  [BillingArrangementLabel.OTHER]: msg`Other`,
};
