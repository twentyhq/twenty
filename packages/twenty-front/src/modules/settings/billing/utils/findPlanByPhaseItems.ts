import {
  type BillingSubscriptionSchedulePhaseItem,
  type ListPlansQuery,
} from '~/generated-metadata/graphql';

export const findPlanByPhaseItems = ({
  plans,
  phaseItems,
}: {
  plans: ListPlansQuery['listPlans'];
  phaseItems: Pick<BillingSubscriptionSchedulePhaseItem, 'price'>[];
}) => {
  const phasePriceIds = new Set(phaseItems.map((item) => item.price));

  return plans.find((plan) =>
    plan.baseProducts.some((product) =>
      product.prices?.some((price) => phasePriceIds.has(price.stripePriceId)),
    ),
  );
};
