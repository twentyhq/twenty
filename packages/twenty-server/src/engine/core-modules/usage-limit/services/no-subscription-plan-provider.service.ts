import { SubscriptionPlanProvider } from 'src/engine/core-modules/usage-limit/interfaces/subscription-plan-provider.service';
import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type SubscriptionPlan } from 'src/engine/core-modules/usage-limit/types/subscription-plan.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export class NoSubscriptionPlanProvider extends SubscriptionPlanProvider {
  async isCreditAllowanceEnabled(): Promise<boolean> {
    return false;
  }

  async getCreditAllowancePeriod(): Promise<UsagePeriod | null> {
    return null;
  }

  async getCreditAllowance(): Promise<CreditAllowance | null> {
    return null;
  }

  async getSubscriptionPlan(): Promise<SubscriptionPlan | null> {
    return null;
  }
}
