import { isPriceInPlan } from '@/settings/billing/utils/isPriceInPlan';
import { findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';

export const usePlanByPriceId = () => {
  const { listPlans } = usePlans();

  const getPlanByPriceId = (priceId: string) =>
    findOrThrow(listPlans(), (plan) =>
      isPriceInPlan({ plan, stripePriceId: priceId }),
    );

  return { getPlanByPriceId };
};
