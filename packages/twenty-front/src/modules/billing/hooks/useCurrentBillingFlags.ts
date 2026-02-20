import {
  SubscriptionInterval,
  BillingPlanKey,
} from '~/generated-metadata/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

export const useCurrentBillingFlags = () => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

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
