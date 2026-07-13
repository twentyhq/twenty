import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook } from '@testing-library/react';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';
import { useInitializeQueryParamState } from '~/modules/app/hooks/useInitializeQueryParamState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const renderUseInitializeQueryParamState = (search: string) => {
  window.history.pushState({}, '', `/${search}`);

  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
  });

  const { result } = renderHook(() => useInitializeQueryParamState(), {
    wrapper: Wrapper,
  });

  result.current.initializeQueryParamState();
};

describe('useInitializeQueryParamState', () => {
  it('should set couponCode on billing checkout session state from query param', () => {
    renderUseInitializeQueryParamState('?couponCode=SAVE20');

    expect(jotaiStore.get(billingCheckoutSessionState.atom)).toEqual({
      plan: BillingPlanKey.PRO,
      interval: SubscriptionInterval.Month,
      requirePaymentMethod: true,
      couponCode: 'SAVE20',
    });
  });

  it('should parse billingCheckoutSession from query param and keep couponCode', () => {
    const billingCheckoutSession = JSON.stringify({
      plan: BillingPlanKey.ENTERPRISE,
      interval: SubscriptionInterval.Year,
      requirePaymentMethod: false,
    });

    renderUseInitializeQueryParamState(
      `?billingCheckoutSession=${encodeURIComponent(billingCheckoutSession)}&couponCode=SAVE20`,
    );

    expect(jotaiStore.get(billingCheckoutSessionState.atom)).toEqual({
      plan: BillingPlanKey.ENTERPRISE,
      interval: SubscriptionInterval.Year,
      requirePaymentMethod: false,
      couponCode: 'SAVE20',
    });
  });

  it('should parse billingCheckoutSessionState round-tripped by social SSO', () => {
    const billingCheckoutSession = JSON.stringify({
      plan: BillingPlanKey.PRO,
      interval: SubscriptionInterval.Year,
      requirePaymentMethod: true,
      couponCode: 'SAVE20',
    });

    renderUseInitializeQueryParamState(
      `?billingCheckoutSessionState=${encodeURIComponent(billingCheckoutSession)}`,
    );

    expect(jotaiStore.get(billingCheckoutSessionState.atom)).toEqual({
      plan: BillingPlanKey.PRO,
      interval: SubscriptionInterval.Year,
      requirePaymentMethod: true,
      couponCode: 'SAVE20',
    });
  });
});
