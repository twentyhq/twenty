import { usePlans } from '@/settings/billing/hooks/usePlans';
import { getReverseTrialPlanKeys } from '@/settings/billing/utils/getReverseTrialPlanKeys';

export const useReverseTrialPlanKeys = () => {
  const { listPlans } = usePlans();

  const reverseTrialPlanKeys = getReverseTrialPlanKeys(listPlans());

  return { reverseTrialPlanKeys };
};
