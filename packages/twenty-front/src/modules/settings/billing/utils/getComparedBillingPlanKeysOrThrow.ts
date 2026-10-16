import { type SettingsBillingComparedPlanKeys } from '@/settings/billing/types/SettingsBillingPlanComparison';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type BillingPlan } from '~/generated-metadata/graphql';

export const getComparedBillingPlanKeysOrThrow = (
  plans: Pick<BillingPlan, 'isSellable' | 'planKey'>[],
): SettingsBillingComparedPlanKeys => {
  const [firstPlanKey, secondPlanKey, ...otherPlanKeys] = plans
    .filter((plan) => plan.isSellable)
    .map((plan) => plan.planKey);

  if (
    !isDefined(firstPlanKey) ||
    !isDefined(secondPlanKey) ||
    isNonEmptyArray(otherPlanKeys)
  ) {
    throw new Error(
      doNotTranslate('The plan comparison expects exactly two plans on sale'),
    );
  }

  return [firstPlanKey, secondPlanKey];
};
