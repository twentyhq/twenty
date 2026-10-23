import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { isDefined } from 'twenty-shared/utils';

export const useNextPlan = () => {
  const { nextBillingPhase } = useNextBillingPhase();
  const { isPlansLoaded, listPlans } = usePlans({
    skip: !isDefined(nextBillingPhase),
  });

  const nextPlan =
    isPlansLoaded && isDefined(nextBillingPhase)
      ? listPlans().find((plan) =>
          plan.baseProducts.some((product) =>
            product.prices?.some((price) =>
              nextBillingPhase.items.some(
                (item) => item.price === price.stripePriceId,
              ),
            ),
          ),
        )
      : undefined;

  return {
    nextPlan,
  };
};
