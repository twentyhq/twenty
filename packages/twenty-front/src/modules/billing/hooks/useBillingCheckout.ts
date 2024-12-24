import { billingCheckoutState } from '@/billing/states/billingCheckoutState';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { BillingPlanKey } from '~/generated/graphql';

type BillingCheckout = {
  plan: BillingPlanKey | null;
  interval?: string;
  requirePaymentMethod: boolean;
  skipPlanPage: boolean;
};

export const useBillingCheckout = (): BillingCheckout => {
  const { search } = useLocation();
  const [billingCheckout, setBillingCheckout] =
    useRecoilState(billingCheckoutState);

  const hasFreePassParameter =
    search.includes('freepass') ||
    search.includes('freePass') ||
    search.includes('free-pass') ||
    search.includes('Free-pass') ||
    search.includes('FreePass');

  if (
    billingCheckout.requirePaymentMethod &&
    (hasFreePassParameter || search.includes('requirePaymentMethod=true'))
  ) {
    setBillingCheckout((prev) => ({
      ...prev,
      requirePaymentMethod: false,
      skipPlanPage: true,
    }));
  }

  const planFromUrl = search.match(/[?&]plan=([^&]+)/)?.[1]?.toUpperCase();

  if (
    planFromUrl !== undefined &&
    planFromUrl !== '' &&
    Object.values(BillingPlanKey).includes(planFromUrl as BillingPlanKey)
  ) {
    setBillingCheckout((prev) => ({
      ...prev,
      plan: planFromUrl as BillingPlanKey,
      skipPlanPage: true,
    }));
  }

  return billingCheckout;
};
