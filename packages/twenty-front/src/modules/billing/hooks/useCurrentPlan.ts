import { BillingPlanKey } from '~/generated-metadata/graphql';
import { assertIsDefinedOrThrow, findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useCurrentPlan = () => {
  const { listPlans } = usePlans();

  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

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
