import { doNotTranslate } from 'twenty-shared/i18n';
import { findOrThrow } from 'twenty-shared/utils';
import { type BillingPlan } from '~/generated-metadata/graphql';

export const getDefaultCheckoutPlanKeyOrThrow = (
  plans: Pick<BillingPlan, 'isSellable' | 'planKey'>[],
) =>
  findOrThrow(
    plans,
    (plan) => plan.isSellable,
    new Error(doNotTranslate('No billing plan on sale')),
  ).planKey;
