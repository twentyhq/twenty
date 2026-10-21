import { doNotTranslate } from 'twenty-shared/i18n';
import { findOrThrow } from 'twenty-shared/utils';
import { type BillingPlan } from '~/generated-metadata/graphql';

export const getDefaultCheckoutPlanKeyOrThrow = (
  plans: Pick<BillingPlan, 'isCheckoutDefault' | 'planKey'>[],
) =>
  findOrThrow(
    plans,
    (plan) => plan.isCheckoutDefault,
    new Error(doNotTranslate('No default checkout billing plan')),
  ).planKey;
