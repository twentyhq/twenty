import { isDefined } from 'twenty-shared/utils';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

type GetBillingStateAfterScheduledChangeParams = {
  currentInterval: SubscriptionInterval | null | undefined;
  currentPlanKey: BillingPlanKey | null | undefined;
  scheduledInterval: SubscriptionInterval | null | undefined;
  scheduledPlanKey: BillingPlanKey | null | undefined;
};

export const getBillingStateAfterScheduledChange = ({
  currentInterval,
  currentPlanKey,
  scheduledInterval,
  scheduledPlanKey,
}: GetBillingStateAfterScheduledChangeParams) => {
  const isPlanSwitchScheduled =
    isDefined(scheduledPlanKey) && scheduledPlanKey !== currentPlanKey;
  const isIntervalSwitchScheduled =
    isDefined(scheduledInterval) && scheduledInterval !== currentInterval;

  return {
    interval: isIntervalSwitchScheduled ? scheduledInterval : currentInterval,
    isIntervalSwitchScheduled,
    isPlanSwitchScheduled,
    planKey: isPlanSwitchScheduled ? scheduledPlanKey : currentPlanKey,
  };
};
