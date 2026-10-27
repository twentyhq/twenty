import { doNotTranslate } from 'twenty-shared/i18n';
import { findOrThrow, isDefined } from 'twenty-shared/utils';
import {
  type BillingPlan,
  type BillingPlanKey,
} from '~/generated-metadata/graphql';

export const getCheckoutPlanKeyOrThrow = ({
  plans,
  requestedPlanKey,
}: {
  plans: Pick<BillingPlan, 'isCheckoutDefault' | 'isSellable' | 'planKey'>[];
  requestedPlanKey?: BillingPlanKey;
}): BillingPlanKey => {
  const requestedPlan = plans.find(
    (plan) => plan.planKey === requestedPlanKey && plan.isSellable,
  );

  if (isDefined(requestedPlan)) {
    return requestedPlan.planKey;
  }

  return findOrThrow(
    plans,
    (plan) => plan.isCheckoutDefault,
    new Error(doNotTranslate('No default checkout billing plan')),
  ).planKey;
};
