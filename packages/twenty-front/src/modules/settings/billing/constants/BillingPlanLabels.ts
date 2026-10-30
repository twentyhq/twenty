import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { BillingPlanKey } from '~/generated-metadata/graphql';

export const BILLING_PLAN_LABELS: Record<BillingPlanKey, MessageDescriptor> = {
  [BillingPlanKey.PRO]: msg`Pro`,
  [BillingPlanKey.ENTERPRISE]: msg`Organization`,
  [BillingPlanKey.PRO_V2]: msg`Pro`,
  [BillingPlanKey.ORGANIZATION_V2]: msg`Organization`,
};
