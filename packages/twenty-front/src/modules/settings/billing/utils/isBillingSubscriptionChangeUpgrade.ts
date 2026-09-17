import { type BillingSubscriptionChange } from '@/settings/billing/types/billingSubscriptionChange.type';
import { assertUnreachable } from 'twenty-shared/utils';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const isBillingSubscriptionChangeUpgrade = ({
  change,
  upcomingInterval,
  upcomingPlanKey,
}: {
  change: BillingSubscriptionChange;
  upcomingInterval: SettingsBillingPlanInterval;
  upcomingPlanKey: BillingPlanKey;
}) => {
  switch (change.type) {
    case 'SWITCH_PLAN':
      return change.targetPlanKey === BillingPlanKey.ENTERPRISE;
    case 'SWITCH_INTERVAL':
      return change.targetInterval === SubscriptionInterval.Year;
    case 'CANCEL_PLAN_SWITCH':
      return upcomingPlanKey === BillingPlanKey.PRO;
    case 'CANCEL_INTERVAL_SWITCH':
      return upcomingInterval === SubscriptionInterval.Month;
    default:
      return assertUnreachable(change);
  }
};
