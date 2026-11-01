import { type BillingPlanKey } from '~/generated-metadata/graphql';
import { findOrThrow } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { usePlans } from './usePlans';

export const usePlanByPlanKey = () => {
  const { listPlans } = usePlans();

  const getPlanByPlanKey = (planKey: BillingPlanKey) =>
    findOrThrow(
      listPlans(),
      (plan) => plan.planKey === planKey,
      new Error(doNotTranslate(`Plan ${planKey} not found`)),
    );

  return { getPlanByPlanKey };
};
