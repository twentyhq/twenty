import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';

export const getOppositeInterval = (interval: SubscriptionInterval) => {
  if (interval === SubscriptionInterval.Month) return SubscriptionInterval.Year;
  if (interval === SubscriptionInterval.Year) return SubscriptionInterval.Month;
  throw new BillingException(
    `Interval invalid`,
    BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_INVALID,
  );
};
