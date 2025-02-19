/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

export type BillingProductMetadata =
  | {
      planKey: BillingPlanKey;
      priceUsageBased: BillingUsageType;
      isBaseProduct: 'true' | 'false';
      [key: string]: string;
    }
  | Record<string, never>;
