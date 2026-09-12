import {
  SubscriptionInterval,
  BillingPlanKey,
} from '~/generated-metadata/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

export const useCurrentBillingFlags = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  const interval = currentWorkspace.currentBillingSubscription?.interval;
  const planKey = getSubscriptionPlanKey(
    currentWorkspace.currentBillingSubscription,
  );

  const isMonthlyPlan = interval === SubscriptionInterval.Month;
  const isYearlyPlan = interval === SubscriptionInterval.Year;
  const isProPlan = planKey === BillingPlanKey.PRO;
  const isEnterprisePlan = planKey === BillingPlanKey.ENTERPRISE;

  return {
    isMonthlyPlan,
    isYearlyPlan,
    isProPlan,
    isEnterprisePlan,
    planKey,
    interval,
  };
};
