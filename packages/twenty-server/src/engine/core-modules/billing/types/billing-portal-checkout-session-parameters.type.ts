/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type BillingPortalCheckoutSessionParameters = {
  user: AuthContextUser;
  workspace: WorkspaceEntity;
  billingPricesPerPlan: BillingGetPricesPerPlanResult;
  successUrlPath?: string;
  plan: BillingPlanKey;
  requirePaymentMethod?: boolean;
};
