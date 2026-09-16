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

  it('does not mark another plan as scheduled when only the interval matches the schedule', () => {
    expect(
      getBillingPlanActionType(
        buildParams({
          planKey: BillingPlanKey.PRO,
          scheduledInterval: SubscriptionInterval.Year,
          scheduledPlanKey: BillingPlanKey.ENTERPRISE,
          selectedInterval: SubscriptionInterval.Year,
        }),
      ),
    ).toBe('SWITCH_INTERVAL');
  });

  it('does not mark another interval as scheduled when only the plan matches the schedule', () => {
    expect(
      getBillingPlanActionType(
        buildParams({
          planKey: BillingPlanKey.ENTERPRISE,
          scheduledInterval: SubscriptionInterval.Month,
          scheduledPlanKey: BillingPlanKey.ENTERPRISE,
          selectedInterval: SubscriptionInterval.Year,
        }),
      ),
    ).toBe('SWITCH_INTERVAL_FIRST');
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
