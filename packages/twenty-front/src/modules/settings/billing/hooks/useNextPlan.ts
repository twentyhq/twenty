import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { findPlanByPhaseItems } from '@/settings/billing/utils/findPlanByPhaseItems';
import { isDefined } from 'twenty-shared/utils';

export const useNextPlan = () => {
  const { nextBillingPhase } = useNextBillingPhase();
  const { isPlansLoaded, listPlans } = usePlans({
    skip: !isDefined(nextBillingPhase),
  });

  const nextPlan =
    isPlansLoaded && isDefined(nextBillingPhase)
      ? findPlanByPhaseItems({
          plans: listPlans(),
          phaseItems: nextBillingPhase.items,
        })
      : undefined;

  return {
    nextPlan,
  };
};
