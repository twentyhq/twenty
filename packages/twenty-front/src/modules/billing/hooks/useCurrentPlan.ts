import { BillingPlanKey } from '~/generated-metadata/graphql';
import { assertIsDefinedOrThrow, findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentPlan = () => {
  const { listPlans } = usePlans();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  const planKeyFromMetadata =
    (currentWorkspace.currentBillingSubscription?.metadata?.['plan'] as
      | BillingPlanKey
      | undefined) ?? BillingPlanKey.PRO;

  const currentPlan = findOrThrow(
    listPlans(),
    (plan) => plan.planKey === planKeyFromMetadata,
    new Error('Current plan not found'),
  );

  const oppositPlan =
    planKeyFromMetadata === BillingPlanKey.ENTERPRISE
      ? BillingPlanKey.PRO
      : BillingPlanKey.ENTERPRISE;

  return { currentPlan, oppositPlan };
};
