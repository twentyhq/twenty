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
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Keep this developer invariant stable for error grouping.
    new Error('Current plan not found'),
  );

  return { currentPlan };
};
