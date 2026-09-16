import { getBillingStateAfterScheduledChange } from '@/settings/billing/utils/getBillingStateAfterScheduledChange';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const subscribedProMonthly = {
  currentInterval: SubscriptionInterval.Month,
  currentPlanKey: BillingPlanKey.PRO,
};

describe('getBillingStateAfterScheduledChange', () => {
  it('returns the subscribed plan and interval when nothing is scheduled', () => {
    expect(
      getBillingStateAfterScheduledChange({
        ...subscribedProMonthly,
        scheduledInterval: undefined,
        scheduledPlanKey: undefined,
      }),
    ).toEqual({
      interval: SubscriptionInterval.Month,
      isIntervalSwitchScheduled: false,
      isPlanSwitchScheduled: false,
      planKey: BillingPlanKey.PRO,
    });
  });

  it('ignores a scheduled phase that repeats the subscribed plan and interval', () => {
    expect(
      getBillingStateAfterScheduledChange({
        ...subscribedProMonthly,
        scheduledInterval: SubscriptionInterval.Month,
        scheduledPlanKey: BillingPlanKey.PRO,
      }),
    ).toEqual({
      interval: SubscriptionInterval.Month,
      isIntervalSwitchScheduled: false,
      isPlanSwitchScheduled: false,
      planKey: BillingPlanKey.PRO,
    });
  });

  it('takes the scheduled plan and keeps the subscribed interval', () => {
    expect(
      getBillingStateAfterScheduledChange({
        ...subscribedProMonthly,
        scheduledInterval: SubscriptionInterval.Month,
        scheduledPlanKey: BillingPlanKey.ENTERPRISE,
      }),
    ).toEqual({
      interval: SubscriptionInterval.Month,
      isIntervalSwitchScheduled: false,
      isPlanSwitchScheduled: true,
      planKey: BillingPlanKey.ENTERPRISE,
    });
  });

  it('takes the scheduled interval and keeps the subscribed plan', () => {
    expect(
      getBillingStateAfterScheduledChange({
        ...subscribedProMonthly,
        scheduledInterval: SubscriptionInterval.Year,
        scheduledPlanKey: BillingPlanKey.PRO,
      }),
    ).toEqual({
      interval: SubscriptionInterval.Year,
      isIntervalSwitchScheduled: true,
      isPlanSwitchScheduled: false,
      planKey: BillingPlanKey.PRO,
    });
  });

  it('takes both dimensions when both are scheduled', () => {
    expect(
      getBillingStateAfterScheduledChange({
        currentInterval: SubscriptionInterval.Year,
        currentPlanKey: BillingPlanKey.ENTERPRISE,
        scheduledInterval: SubscriptionInterval.Month,
        scheduledPlanKey: BillingPlanKey.PRO,
      }),
    ).toEqual({
      interval: SubscriptionInterval.Month,
      isIntervalSwitchScheduled: true,
      isPlanSwitchScheduled: true,
      planKey: BillingPlanKey.PRO,
    });
  });
});
