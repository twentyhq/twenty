import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, findOrThrow } from 'twenty-shared/utils';
import { type BillingPlan } from '~/generated-metadata/graphql';

export const getDefaultCheckoutPlanKeyOrThrow = (
  plans: Pick<BillingPlan, 'isCheckoutDefault' | 'planKey'>[],
) =>
  findOrThrow(
    plans,
    (plan) => plan.isCheckoutDefault,
    new CustomError(
      doNotTranslate('No default checkout billing plan'),
      'BILLING_DEFAULT_CHECKOUT_PLAN_NOT_FOUND',
    ),
  ).planKey;
