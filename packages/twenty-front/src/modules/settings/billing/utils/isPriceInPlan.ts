import { type ListPlansQuery } from '~/generated-metadata/graphql';

export const isPriceInPlan = ({
  plan,
  stripePriceId,
}: {
  plan: Pick<
    ListPlansQuery['listPlans'][number],
    'baseProducts' | 'resourceCreditProducts' | 'meteredProducts'
  >;
  stripePriceId: string;
}) =>
  [
    ...plan.baseProducts,
    ...plan.resourceCreditProducts,
    ...plan.meteredProducts,
  ].some((product) =>
    product.prices?.some((price) => price.stripePriceId === stripePriceId),
  );
