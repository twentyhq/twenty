import { type BillingPlanKey } from '~/generated-metadata/graphql';
import { findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';

export const usePlanByPlanKey = () => {
  const { listPlans } = usePlans();

  const getPlanByPlanKey = (planKey: BillingPlanKey) =>
    findOrThrow(
      listPlans(),
      (plan) => plan.planKey === planKey,
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- Keep this developer invariant stable for error grouping.
      new Error(`Plan ${planKey} not found`),
    );

  return { getPlanByPlanKey };
};
