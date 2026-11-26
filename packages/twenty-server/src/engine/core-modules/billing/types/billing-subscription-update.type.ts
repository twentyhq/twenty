import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export enum SubscriptionUpdateType {
  PLAN = 'PLAN',
  RESOURCE_CREDIT_PRICE = 'RESOURCE_CREDIT_PRICE',
  QUANTITIES = 'QUANTITIES',
  APPLICATIONS = 'APPLICATIONS',
  INTERVAL = 'INTERVAL',
}

export type SubscriptionUpdate =
  | {
      type: SubscriptionUpdateType.PLAN;
      newPlan: BillingPlanKey;
    }
  | {
      type: SubscriptionUpdateType.RESOURCE_CREDIT_PRICE;
      newResourceCreditPriceId: string;
    }
  | {
      type: SubscriptionUpdateType.QUANTITIES;
      newSeats: number;
    }
  | {
      type: SubscriptionUpdateType.APPLICATIONS;
      additionalConnectedAccountApplicationId?: string;
    }
  | {
      type: SubscriptionUpdateType.INTERVAL;
      newInterval: SubscriptionInterval;
    };
