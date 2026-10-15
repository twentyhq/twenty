import { type TagColor } from 'twenty-ui/primitives/data-display';

import { BillingPlanKey } from '~/generated-metadata/graphql';

export const BILLING_PLAN_TAG_COLORS: Record<BillingPlanKey, TagColor> = {
  [BillingPlanKey.PRO]: 'sky',
  [BillingPlanKey.ENTERPRISE]: 'purple',
  [BillingPlanKey.PRO_V2]: 'sky',
  [BillingPlanKey.ORGANIZATION_V2]: 'purple',
};
