import { type BillingSubscriptionChange } from '@/settings/billing/types/billingSubscriptionChange.type';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  BillingPlanKey,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

export const isBillingSubscriptionChangeImmediate = ({
  change,
  subscriptionStatus,
}: {
  change: BillingSubscriptionChange;
  subscriptionStatus: SubscriptionStatus | undefined;
}) => {
  if (subscriptionStatus === SubscriptionStatus.Trialing) {
    return true;
  }

  switch (change.type) {
    case 'SWITCH_PLAN':
      return change.targetPlanKey === BillingPlanKey.ENTERPRISE;
    case 'SWITCH_INTERVAL':
      return change.targetInterval === SubscriptionInterval.Year;
    case 'CANCEL_PLAN_SWITCH':
    case 'CANCEL_INTERVAL_SWITCH':
      return true;
    default:
      return assertUnreachable(change);
  }
};
