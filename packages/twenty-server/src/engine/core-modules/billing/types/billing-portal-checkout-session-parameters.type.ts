/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type BillingPortalCheckoutSessionParameters = {
  user: UserEntity;
  workspace: WorkspaceEntity;
  billingPricesPerPlan: BillingGetPricesPerPlanResult;
  successUrlPath?: string;
  plan: BillingPlanKey;
  requirePaymentMethod?: boolean;
};
