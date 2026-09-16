import { type SettingsBillingPlanActionType } from '@/settings/billing/types/settingsBillingPlanAction.type';
import { getBillingPlanActionType } from '@/settings/billing/utils/getBillingPlanActionType';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

type Params = Parameters<typeof getBillingPlanActionType>[0];

const buildParams = (overrides: Partial<Params>): Params => ({
  canSwitchSubscription: true,
  currentInterval: SubscriptionInterval.Month,
  currentPlanKey: BillingPlanKey.PRO,
  hasPermissionToManageBilling: true,
  isCancellationScheduled: false,
  isSubscriptionCanceled: false,
  planKey: BillingPlanKey.PRO,
  scheduledInterval: undefined,
  scheduledPlanKey: undefined,
  selectedInterval: SubscriptionInterval.Month,
  shouldUpdatePayment: false,
  ...overrides,
});

const organizationYearlyWithMonthlyScheduled = {
  currentInterval: SubscriptionInterval.Year,
  currentPlanKey: BillingPlanKey.ENTERPRISE,
  scheduledInterval: SubscriptionInterval.Month,
  scheduledPlanKey: BillingPlanKey.ENTERPRISE,
};

const organizationYearlyWithProYearlyScheduled = {
  currentInterval: SubscriptionInterval.Year,
  currentPlanKey: BillingPlanKey.ENTERPRISE,
  scheduledInterval: SubscriptionInterval.Year,
  scheduledPlanKey: BillingPlanKey.PRO,
};

const organizationYearlyWithProMonthlyScheduled = {
  currentInterval: SubscriptionInterval.Year,
  currentPlanKey: BillingPlanKey.ENTERPRISE,
  scheduledInterval: SubscriptionInterval.Month,
  scheduledPlanKey: BillingPlanKey.PRO,
};

const proCell = { planKey: BillingPlanKey.PRO };
const organizationCell = { planKey: BillingPlanKey.ENTERPRISE };
const monthly = { selectedInterval: SubscriptionInterval.Month };
const yearly = { selectedInterval: SubscriptionInterval.Year };

describe('getBillingPlanActionType', () => {
  it.each<[string, Partial<Params>, SettingsBillingPlanActionType]>([
    ['the subscribed plan at the subscribed interval', {}, 'CURRENT'],
    ['the subscribed plan at another interval', yearly, 'SWITCH_INTERVAL'],
    [
      'another plan at the subscribed interval',
      organizationCell,
      'SWITCH_PLAN',
    ],
    [
      'another plan at another interval, which takes two steps',
      { ...organizationCell, ...yearly },
      'SWITCH_INTERVAL_FIRST',
    ],
    [
      'the scheduled plan at the scheduled interval',
      {
        ...organizationCell,
        ...yearly,
        scheduledInterval: SubscriptionInterval.Year,
        scheduledPlanKey: BillingPlanKey.ENTERPRISE,
      },
      'SCHEDULED',
    ],
    [
      'a plan switch resolved against the scheduled interval',
      { ...organizationYearlyWithMonthlyScheduled, ...proCell, ...monthly },
      'SWITCH_PLAN',
    ],
    [
      'the subscribed pair while an interval switch is scheduled',
      {
        ...organizationYearlyWithMonthlyScheduled,
        ...organizationCell,
        ...yearly,
      },
      'CURRENT',
    ],
    [
      'the scheduled pair of an interval switch',
      {
        ...organizationYearlyWithMonthlyScheduled,
        ...organizationCell,
        ...monthly,
      },
      'SCHEDULED',
    ],
    [
      'the cell a scheduled interval switch blocks',
      { ...organizationYearlyWithMonthlyScheduled, ...proCell, ...yearly },
      'CANCEL_INTERVAL_SWITCH',
    ],
    [
      'the cell a scheduled plan switch blocks',
      {
        ...organizationYearlyWithProYearlyScheduled,
        ...organizationCell,
        ...monthly,
      },
      'CANCEL_PLAN_SWITCH',
    ],
    [
      'the cell dropping the plan of a scheduled switch',
      {
        ...organizationYearlyWithProMonthlyScheduled,
        ...organizationCell,
        ...monthly,
      },
      'CANCEL_PLAN_SWITCH',
    ],
    [
      'the cell dropping the interval of a scheduled switch',
      { ...organizationYearlyWithProMonthlyScheduled, ...proCell, ...yearly },
      'CANCEL_INTERVAL_SWITCH',
    ],
    [
      'the subscribed pair while both dimensions are scheduled',
      {
        ...organizationYearlyWithProMonthlyScheduled,
        ...organizationCell,
        ...yearly,
      },
      'CURRENT',
    ],
    [
      'the scheduled pair while both dimensions are scheduled',
      { ...organizationYearlyWithProMonthlyScheduled, ...proCell, ...monthly },
      'SCHEDULED',
    ],
    [
      'a canceled subscription',
      { isSubscriptionCanceled: true },
      'MANAGE_BILLING',
    ],
    [
      'another plan while payment is overdue',
      { ...organizationCell, shouldUpdatePayment: true },
      'UPDATE_PAYMENT',
    ],
    [
      'the subscribed plan while payment is overdue',
      { shouldUpdatePayment: true },
      'CURRENT',
    ],
    [
      'a member without the billing permission',
      {
        ...organizationCell,
        canSwitchSubscription: false,
        hasPermissionToManageBilling: false,
      },
      'CONTACT_ADMIN',
    ],
    [
      'a subscription that cannot be switched',
      { ...organizationCell, canSwitchSubscription: false },
      'UNAVAILABLE',
    ],
  ])('resolves %s', (_description, overrides, expected) => {
    expect(getBillingPlanActionType(buildParams(overrides))).toBe(expected);
  });
});
