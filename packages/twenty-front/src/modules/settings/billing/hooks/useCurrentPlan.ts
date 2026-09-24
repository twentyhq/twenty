import { BillingPlanKey } from '~/generated-metadata/graphql';
import { assertIsDefinedOrThrow, findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentPlan = () => {
  const { listPlans } = usePlans();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  const currentPlanKey = getSubscriptionPlanKey(
    currentWorkspace.currentBillingSubscription,
  );

  const currentPlan = findOrThrow(
    listPlans(),
    (plan) => plan.planKey === currentPlanKey,
    new Error('Current plan not found'),
  );

  const oppositPlan =
    currentPlanKey === BillingPlanKey.ENTERPRISE
      ? BillingPlanKey.PRO
      : BillingPlanKey.ENTERPRISE;

  return { currentPlan, oppositPlan };
};
