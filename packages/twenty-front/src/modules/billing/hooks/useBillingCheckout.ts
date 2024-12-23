import { billingCheckoutState } from '@/billing/states/billingCheckoutState';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { BillingPlanKey } from '~/generated/graphql';

export const useBillingCheckout = () => {
  const { search } = useLocation();
  const [billingCheckout, setBillingCheckout] =
    useRecoilState(billingCheckoutState);

  const hasFreePassParameter =
    search.includes('freepass') ||
    search.includes('freePass') ||
    search.includes('free-pass') ||
    search.includes('Free-pass') ||
    search.includes('FreePass');

  if (hasFreePassParameter || search.includes('requirePaymentMethod=true')) {
    setBillingCheckout({
      plan: billingCheckout.plan,
      interval: billingCheckout.interval,
      requirePaymentMethod: false,
      skipPlanPage: true,
    });
  }

  const planFromUrl = search.match(/[?&]plan=([^&]+)/)?.[1]?.toUpperCase();

  if (
    planFromUrl !== null &&
    planFromUrl !== undefined &&
    Object.values(BillingPlanKey).includes(planFromUrl as BillingPlanKey)
  ) {
    setBillingCheckout({
      plan: planFromUrl as BillingPlanKey,
      interval: billingCheckout.interval,
      requirePaymentMethod: billingCheckout.requirePaymentMethod,
      skipPlanPage: true,
    });
  }

  return billingCheckout;
};
