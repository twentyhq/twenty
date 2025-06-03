/* @license Enterprise */

import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { InterCreateChargeDto } from 'src/engine/core-modules/inter/dtos/inter-create-charge.dto';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { APP_LOCALES } from 'twenty-shared/translations';

export type BillingPortalCheckoutSessionParameters = {
  user: User;
  workspace: Workspace;
  billingPricesPerPlan?: BillingGetPricesPerPlanResult;
  successUrlPath?: string;
  plan: BillingPlanKey;
  requirePaymentMethod?: boolean;
  paymentProvider?: BillingPaymentProviders;
  interChargeData?: InterCreateChargeDto;
  locale?: keyof typeof APP_LOCALES;
};
