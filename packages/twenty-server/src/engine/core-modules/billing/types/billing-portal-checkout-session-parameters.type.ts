/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export type BillingPortalCheckoutSessionParameters = {
  user: User;
  workspace: Workspace;
  billingPricesPerPlan?: BillingGetPricesPerPlanResult;
  successUrlPath?: string;
  plan: BillingPlanKey;
  priceId?: string;
  requirePaymentMethod?: boolean;
};
