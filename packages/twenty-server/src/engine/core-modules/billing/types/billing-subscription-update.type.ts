import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export enum SubscriptionUpdateType {
  PLAN = 'PLAN',
  PLAN_AND_INTERVAL = 'PLAN_AND_INTERVAL',
  RESOURCE_CREDIT_PRICE = 'RESOURCE_CREDIT_PRICE',
  SEATS = 'SEATS',
  INTERVAL = 'INTERVAL',
}

export type SubscriptionUpdate =
  | {
      type: SubscriptionUpdateType.PLAN;
      newPlan: BillingPlanKey;
    }
  | {
      type: SubscriptionUpdateType.PLAN_AND_INTERVAL;
      newPlan: BillingPlanKey;
      newInterval: SubscriptionInterval;
    }
  | {
      type: SubscriptionUpdateType.RESOURCE_CREDIT_PRICE;
      newResourceCreditPriceId: string;
    }
  | {
      type: SubscriptionUpdateType.SEATS;
      newSeats: number;
    }
  | {
      type: SubscriptionUpdateType.INTERVAL;
      newInterval: SubscriptionInterval;
    };
