import { SubscriptionInterval } from '~/generated-metadata/graphql';
import { BillingPlanKey } from '~/generated/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

export const useCurrentBillingFlags = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  const interval = currentWorkspace.currentBillingSubscription?.interval;
  const planKey = currentWorkspace.currentBillingSubscription?.metadata?.[
    'plan'
  ] as BillingPlanKey | undefined;

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
