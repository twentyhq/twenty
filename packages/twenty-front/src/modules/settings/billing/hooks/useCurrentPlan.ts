import {
  BillingPlanKey,
  BillingProductKey,
} from '~/generated-metadata/graphql';
import { assertIsDefinedOrThrow, findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentPlan = () => {
  const { listPlans } = usePlans();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  // Read off the product the subscription sits on rather than the subscription's
  // own plan metadata, which is a copy that scheduled plan changes never update.
  const currentPlanKey =
    currentWorkspace.currentBillingSubscription?.billingSubscriptionItems?.find(
      (item) =>
        item.billingProduct.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT,
    )?.billingProduct.metadata.planKey;

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
