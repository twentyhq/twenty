import { useIsPlanRequired } from '@/onboarding/hooks/useIsPlanRequired';
import { usePreloadStripeForPlanRequiredStep } from '@/onboarding/hooks/usePreloadStripeForPlanRequiredStep';
import { usePlans } from '@/settings/billing/hooks/usePlans';

export const PrefetchPlanRequiredStepEffect = () => {
  const isPlanRequired = useIsPlanRequired();

  usePlans({ skip: !isPlanRequired });
  usePreloadStripeForPlanRequiredStep();

  return null;
};
