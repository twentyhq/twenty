import { useLocation } from 'react-router-dom';
import { atom, useRecoilState } from 'recoil';

import { BillingPlanKey } from '@/billing/types/billing';

const billingPlanState = atom<BillingPlanKey | null>({
  key: 'billingPlanState',
  default: null,
});

export const useBillingPlan = () => {
  const { search } = useLocation();
  const [billingPlan, setBillingPlan] = useRecoilState(billingPlanState);

  const hasFreePassParameter =
    search.includes('freepass') ||
    search.includes('freePass') ||
    search.includes('free-pass') ||
    search.includes('Free-pass') ||
    search.includes('FreePass');

  if (hasFreePassParameter) {
    setBillingPlan(BillingPlanKey.FREE);
    return billingPlan;
  }

  const planFromUrl = search.match(/[?&]plan=([^&]+)/)?.[1]?.toUpperCase();

  if (
    planFromUrl !== null &&
    planFromUrl !== undefined &&
    Object.values(BillingPlanKey).includes(planFromUrl as BillingPlanKey)
  ) {
    setBillingPlan(planFromUrl as BillingPlanKey);
  }

  return billingPlan;
};
