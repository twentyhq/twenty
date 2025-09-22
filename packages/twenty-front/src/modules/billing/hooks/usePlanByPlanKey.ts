import { type BillingPlanKey } from '~/generated/graphql';
import { findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';

export const usePlanByPlanKey = () => {
  const { listPlans } = usePlans();

  const getPlanByPlanKey = (planKey: BillingPlanKey) =>
    findOrThrow(
      listPlans(),
      (plan) => plan.planKey === planKey,
      new Error(`Plan ${planKey} not found`),
    );

  return { getPlanByPlanKey };
};
