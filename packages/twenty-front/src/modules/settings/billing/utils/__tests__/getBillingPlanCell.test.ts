import { type SettingsBillingPlanCell } from '@/settings/billing/types/SettingsBillingPlanCell';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/SettingsBillingPlanComparison';
import { getBillingPlanCell } from '@/settings/billing/utils/getBillingPlanCell';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const { PRO, ENTERPRISE, PRO_V2, ORGANIZATION_V2 } = BillingPlanKey;
const { Month, Year } = SubscriptionInterval;

const current = { kind: 'current' } as const;
const scheduled = { kind: 'scheduled' } as const;
const switchPlan = (targetPlanKey: BillingPlanKey) =>
  ({ kind: 'change', change: { type: 'SWITCH_PLAN', targetPlanKey } }) as const;
const switchInterval = (targetInterval: SettingsBillingPlanInterval) =>
  ({
    kind: 'change',
    change: { type: 'SWITCH_INTERVAL', targetInterval },
  }) as const;
const cancelPlanSwitch = {
  kind: 'change',
  change: { type: 'CANCEL_PLAN_SWITCH' },
} as const;
const cancelIntervalSwitch = {
  kind: 'change',
  change: { type: 'CANCEL_INTERVAL_SWITCH' },
} as const;

const getGrid = ({
  planKeys = [PRO, ENTERPRISE],
  ...subscription
}: {
  planKeys?: BillingPlanKey[];
  currentPlanKey: BillingPlanKey;
  currentInterval: SettingsBillingPlanInterval;
  upcomingPlanKey: BillingPlanKey;
  upcomingInterval: SettingsBillingPlanInterval;
}) => {
  const grid: Partial<
    Record<BillingPlanKey, Record<SettingsBillingPlanInterval, unknown>>
  > = {};

  for (const planKey of planKeys) {
    grid[planKey] = {
      [Month]: getBillingPlanCell({
        ...subscription,
        planKey,
        interval: Month,
      }),
      [Year]: getBillingPlanCell({ ...subscription, planKey, interval: Year }),
    };
  }

  return grid as Record<
    BillingPlanKey,
    Record<SettingsBillingPlanInterval, SettingsBillingPlanCell>
  >;
};

describe('getBillingPlanCell', () => {
  it('offers a single-step switch from every other cell when nothing is scheduled', () => {
    expect(
      getGrid({
        currentPlanKey: PRO,
        currentInterval: Month,
        upcomingPlanKey: PRO,
        upcomingInterval: Month,
      }),
    ).toEqual({
      [PRO]: { [Month]: current, [Year]: switchInterval(Year) },
      [ENTERPRISE]: {
        [Month]: switchPlan(ENTERPRISE),
        [Year]: switchPlan(ENTERPRISE),
      },
    });
  });

  it('cancels a scheduled plan switch from the current plan column', () => {
    expect(
      getGrid({
        currentPlanKey: PRO,
        currentInterval: Month,
        upcomingPlanKey: ENTERPRISE,
        upcomingInterval: Month,
      }),
    ).toEqual({
      [PRO]: { [Month]: current, [Year]: cancelPlanSwitch },
      [ENTERPRISE]: { [Month]: scheduled, [Year]: switchInterval(Year) },
    });
  });

  it('keeps offering plan switches on other plans while an interval switch is scheduled', () => {
    expect(
      getGrid({
        currentPlanKey: PRO,
        currentInterval: Year,
        upcomingPlanKey: PRO,
        upcomingInterval: Month,
      }),
    ).toEqual({
      [PRO]: { [Month]: scheduled, [Year]: current },
      [ENTERPRISE]: {
        [Month]: switchPlan(ENTERPRISE),
        [Year]: switchPlan(ENTERPRISE),
      },
    });
  });

  it('cancels one dimension at a time when both switches are scheduled', () => {
    expect(
      getGrid({
        currentPlanKey: ENTERPRISE,
        currentInterval: Year,
        upcomingPlanKey: PRO,
        upcomingInterval: Month,
      }),
    ).toEqual({
      [PRO]: { [Month]: scheduled, [Year]: cancelIntervalSwitch },
      [ENTERPRISE]: { [Month]: cancelPlanSwitch, [Year]: current },
    });
  });

  it('offers plan switches outside the upcoming plan column when the current plan is not a column', () => {
    expect(
      getGrid({
        planKeys: [PRO_V2, ORGANIZATION_V2],
        currentPlanKey: ENTERPRISE,
        currentInterval: Month,
        upcomingPlanKey: PRO_V2,
        upcomingInterval: Month,
      }),
    ).toEqual({
      [PRO_V2]: { [Month]: scheduled, [Year]: switchInterval(Year) },
      [ORGANIZATION_V2]: {
        [Month]: switchPlan(ORGANIZATION_V2),
        [Year]: switchPlan(ORGANIZATION_V2),
      },
    });
  });
});
