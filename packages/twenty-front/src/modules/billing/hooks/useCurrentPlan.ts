import { BillingPlanKey } from '~/generated/graphql';
import { assertIsDefinedOrThrow, findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';

export const useCurrentPlan = () => {
  const { listPlans } = usePlans();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  const currentPlan = findOrThrow(
    listPlans(),
    (plan) =>
      plan.planKey ===
      (currentWorkspace.currentBillingSubscription?.metadata?.['plan'] as
        | BillingPlanKey
        | undefined),
    new Error('Current plan not found'),
  );

  const oppositPlan =
    currentWorkspace?.currentBillingSubscription?.metadata?.['plan'] ===
    BillingPlanKey.ENTERPRISE
      ? BillingPlanKey.PRO
      : BillingPlanKey.ENTERPRISE;

  return { currentPlan, oppositPlan };
};
