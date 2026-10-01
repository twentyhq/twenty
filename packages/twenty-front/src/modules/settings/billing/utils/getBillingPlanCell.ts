import { type SettingsBillingPlanCell } from '@/settings/billing/types/SettingsBillingPlanCell';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/SettingsBillingPlanComparison';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

type GetBillingPlanCellParams = {
  currentInterval: SettingsBillingPlanInterval;
  currentPlanKey: BillingPlanKey;
  interval: SettingsBillingPlanInterval;
  planKey: BillingPlanKey;
  upcomingInterval: SettingsBillingPlanInterval;
  upcomingPlanKey: BillingPlanKey;
};

export const getBillingPlanCell = ({
  currentInterval,
  currentPlanKey,
  interval,
  planKey,
  upcomingInterval,
  upcomingPlanKey,
}: GetBillingPlanCellParams): SettingsBillingPlanCell => {
  if (planKey === currentPlanKey && interval === currentInterval) {
    return { kind: 'current' };
  }

  if (planKey === upcomingPlanKey && interval === upcomingInterval) {
    return { kind: 'scheduled' };
  }

  const isPlanSwitchScheduled = upcomingPlanKey !== currentPlanKey;
  const isIntervalSwitchScheduled = upcomingInterval !== currentInterval;

  if (planKey === upcomingPlanKey) {
    return {
      kind: 'change',
      change: isIntervalSwitchScheduled
        ? { type: 'CANCEL_INTERVAL_SWITCH' }
        : { type: 'SWITCH_INTERVAL', targetInterval: interval },
    };
  }

  if (interval === upcomingInterval) {
    return {
      kind: 'change',
      change: isPlanSwitchScheduled
        ? { type: 'CANCEL_PLAN_SWITCH' }
        : { type: 'SWITCH_PLAN', targetPlanKey: planKey },
    };
  }

  if (isPlanSwitchScheduled) {
    return { kind: 'change', change: { type: 'CANCEL_PLAN_SWITCH' } };
  }

  if (isIntervalSwitchScheduled) {
    return { kind: 'change', change: { type: 'CANCEL_INTERVAL_SWITCH' } };
  }

  return {
    kind: 'change',
    change: { type: 'SWITCH_PLAN', targetPlanKey: planKey },
  };
};
