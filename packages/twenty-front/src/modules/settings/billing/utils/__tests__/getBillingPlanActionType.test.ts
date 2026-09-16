import { getBillingPlanActionType } from '@/settings/billing/utils/getBillingPlanActionType';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const buildParams = (
  overrides: Partial<Parameters<typeof getBillingPlanActionType>[0]> = {},
) => ({
  canSwitchSubscription: true,
  currentInterval: SubscriptionInterval.Month,
  currentPlanKey: BillingPlanKey.PRO,
  hasPermissionToManageBilling: true,
  isCancellationScheduled: false,
  isSubscriptionCanceled: false,
  planKey: BillingPlanKey.PRO,
  scheduledInterval: undefined,
  scheduledPlanKey: undefined,
  selectedInterval: SubscriptionInterval.Month as
    | SubscriptionInterval.Month
    | SubscriptionInterval.Year,
  shouldUpdatePayment: false,
  ...overrides,
});

describe('getBillingPlanActionType', () => {
  it('marks the subscribed plan at the subscribed interval as current', () => {
    expect(getBillingPlanActionType(buildParams())).toBe('CURRENT');
  });

  it('switches interval on the subscribed plan at another interval', () => {
    expect(
      getBillingPlanActionType(
        buildParams({ selectedInterval: SubscriptionInterval.Year }),
      ),
    ).toBe('SWITCH_INTERVAL');
  });

  it('switches plan on another plan at the subscribed interval', () => {
    expect(
      getBillingPlanActionType(
        buildParams({ planKey: BillingPlanKey.ENTERPRISE }),
      ),
    ).toBe('SWITCH_PLAN');
  });

  it('blocks another plan at another interval, which takes two steps', () => {
    expect(
      getBillingPlanActionType(
        buildParams({
          planKey: BillingPlanKey.ENTERPRISE,
          selectedInterval: SubscriptionInterval.Year,
        }),
      ),
    ).toBe('SWITCH_INTERVAL_FIRST');
  });

  it('marks the scheduled plan and interval as scheduled', () => {
    expect(
      getBillingPlanActionType(
        buildParams({
          planKey: BillingPlanKey.ENTERPRISE,
          scheduledInterval: SubscriptionInterval.Year,
          scheduledPlanKey: BillingPlanKey.ENTERPRISE,
          selectedInterval: SubscriptionInterval.Year,
        }),
      ),
    ).toBe('SCHEDULED');
  });

  it('offers to cancel the scheduled plan switch on the other cells, rather than rewriting it', () => {
    const scheduledProMonthly = {
      currentInterval: SubscriptionInterval.Year,
      currentPlanKey: BillingPlanKey.ENTERPRISE,
      scheduledInterval: SubscriptionInterval.Month,
      scheduledPlanKey: BillingPlanKey.PRO,
    };

    expect(
      getBillingPlanActionType(
        buildParams({
          ...scheduledProMonthly,
          planKey: BillingPlanKey.PRO,
          selectedInterval: SubscriptionInterval.Year,
        }),
      ),
    ).toBe('CANCEL_PLAN_SWITCH');

    expect(
      getBillingPlanActionType(
        buildParams({
          ...scheduledProMonthly,
          planKey: BillingPlanKey.ENTERPRISE,
          selectedInterval: SubscriptionInterval.Month,
        }),
      ),
    ).toBe('CANCEL_PLAN_SWITCH');
  });

  it('still marks the subscribed and the scheduled cells while a change is scheduled', () => {
    const scheduledProMonthly = {
      currentInterval: SubscriptionInterval.Year,
      currentPlanKey: BillingPlanKey.ENTERPRISE,
      scheduledInterval: SubscriptionInterval.Month,
      scheduledPlanKey: BillingPlanKey.PRO,
    };

    expect(
      getBillingPlanActionType(
        buildParams({
          ...scheduledProMonthly,
          planKey: BillingPlanKey.ENTERPRISE,
          selectedInterval: SubscriptionInterval.Year,
        }),
      ),
    ).toBe('CURRENT');

    expect(
      getBillingPlanActionType(
        buildParams({
          ...scheduledProMonthly,
          planKey: BillingPlanKey.PRO,
          selectedInterval: SubscriptionInterval.Month,
        }),
      ),
    ).toBe('SCHEDULED');
  });

  it('offers to cancel the scheduled interval switch when only the interval is scheduled', () => {
    expect(
      getBillingPlanActionType(
        buildParams({
          planKey: BillingPlanKey.ENTERPRISE,
          scheduledInterval: SubscriptionInterval.Year,
          scheduledPlanKey: BillingPlanKey.PRO,
          selectedInterval: SubscriptionInterval.Month,
        }),
      ),
    ).toBe('CANCEL_INTERVAL_SWITCH');

    expect(
      getBillingPlanActionType(
        buildParams({
          planKey: BillingPlanKey.PRO,
          scheduledInterval: SubscriptionInterval.Year,
          scheduledPlanKey: BillingPlanKey.PRO,
          selectedInterval: SubscriptionInterval.Year,
        }),
      ),
    ).toBe('SCHEDULED');
  });

  it('sends a canceled subscription to the billing portal', () => {
    expect(
      getBillingPlanActionType(buildParams({ isSubscriptionCanceled: true })),
    ).toBe('MANAGE_BILLING');
  });

  it('asks for a payment update before any switch, but leaves the current plan marked as current', () => {
    expect(
      getBillingPlanActionType(
        buildParams({
          planKey: BillingPlanKey.ENTERPRISE,
          shouldUpdatePayment: true,
        }),
      ),
    ).toBe('UPDATE_PAYMENT');

    expect(
      getBillingPlanActionType(buildParams({ shouldUpdatePayment: true })),
    ).toBe('CURRENT');
  });

  it('points a member without the billing permission to an admin', () => {
    expect(
      getBillingPlanActionType(
        buildParams({
          canSwitchSubscription: false,
          hasPermissionToManageBilling: false,
          planKey: BillingPlanKey.ENTERPRISE,
        }),
      ),
    ).toBe('CONTACT_ADMIN');
  });

  it('marks a switch as unavailable when the subscription cannot be switched', () => {
    expect(
      getBillingPlanActionType(
        buildParams({
          canSwitchSubscription: false,
          planKey: BillingPlanKey.ENTERPRISE,
        }),
      ),
    ).toBe('UNAVAILABLE');
  });
});
