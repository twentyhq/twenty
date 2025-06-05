import {
  BillingPlanKey,
  SubscriptionInterval,
  BillingPlanOutput,
  BillingPriceLicensedDto,
} from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';

export const formatPrices = (
  plans: BillingPlanOutput[] | undefined,
  seats: number | undefined,
) => {
  if (!isDefined(plans) || !isDefined(seats)) {
    return;
  }

  const enterprisePlan = plans.find(
    (plan) => plan.planKey === BillingPlanKey.ENTERPRISE,
  );

  const enterpriseYearPrice = enterprisePlan?.baseProduct.prices?.find(
    (price) => price.recurringInterval === SubscriptionInterval.Year,
  ) as BillingPriceLicensedDto;

  const enterpriseMonthPrice = enterprisePlan?.baseProduct.prices?.find(
    (price) => price.recurringInterval === SubscriptionInterval.Month,
  ) as BillingPriceLicensedDto;

  const proPlan = plans.find((plan) => plan.planKey === BillingPlanKey.PRO);

  const proYearPrice = proPlan?.baseProduct.prices?.find(
    (price) => price.recurringInterval === SubscriptionInterval.Year,
  ) as BillingPriceLicensedDto;

  const proMonthPrice = proPlan?.baseProduct.prices?.find(
    (price) => price.recurringInterval === SubscriptionInterval.Month,
  ) as BillingPriceLicensedDto;

  return {
    [BillingPlanKey.ENTERPRISE]: {
      [SubscriptionInterval.Year]:
        (seats * enterpriseYearPrice?.unitAmount) / 100,
      [SubscriptionInterval.Month]:
        (seats * enterpriseMonthPrice?.unitAmount) / 100,
    },
    [BillingPlanKey.PRO]: {
      [SubscriptionInterval.Year]: (seats * proYearPrice?.unitAmount) / 100,
      [SubscriptionInterval.Month]: (seats * proMonthPrice?.unitAmount) / 100,
    },
  };
};
