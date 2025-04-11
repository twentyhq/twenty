import { renderHook } from '@testing-library/react';
import { Provider, useAtom } from 'jotai';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';
import { billingCheckoutSessionAtom } from '../billingCheckoutSessionAtom';

const mockLocation = {
  pathname: '/test',
  search: '',
};

const mockHistory = {
  replaceState: jest.fn(),
};

const setupTest = () => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });

  Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true,
  });

  jest.clearAllMocks();
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    <MemoryRouter>{children}</MemoryRouter>
  </Provider>
);

describe('billingCheckoutSessionAtom', () => {
  beforeEach(() => {
    setupTest();
  });

  it('should initialize with default value when no URL params are present', () => {
    const { result } = renderHook(() => useAtom(billingCheckoutSessionAtom), {
      wrapper: Wrapper,
    });

    expect(result.current[0]).toEqual(BILLING_CHECKOUT_SESSION_DEFAULT_VALUE);
  });

  it('should read value from URL params when present', () => {
    const customValue = {
      plan: BillingPlanKey.ENTERPRISE,
      interval: SubscriptionInterval.Year,
      requirePaymentMethod: false,
    };

    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        search: `?billingCheckoutSession=${encodeURIComponent(JSON.stringify(customValue))}`,
      },
      writable: true,
    });

    const { result } = renderHook(() => useAtom(billingCheckoutSessionAtom), {
      wrapper: Wrapper,
    });

    expect(result.current[0]).toEqual(customValue);
  });

  it('should update URL when state changes', () => {
    const { result } = renderHook(() => useAtom(billingCheckoutSessionAtom), {
      wrapper: Wrapper,
    });

    const newValue = {
      plan: BillingPlanKey.ENTERPRISE,
      interval: SubscriptionInterval.Year,
      requirePaymentMethod: false,
    };

    act(() => {
      result.current[1](newValue);
    });

    expect(mockHistory.replaceState).toHaveBeenCalledWith(
      {},
      '',
      `/test?billingCheckoutSession=${encodeURIComponent(JSON.stringify(newValue))}`,
    );
  });

  it('should handle invalid JSON in URL params', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        search: '?billingCheckoutSession=invalid-json',
      },
      writable: true,
    });

    const { result } = renderHook(() => useAtom(billingCheckoutSessionAtom), {
      wrapper: Wrapper,
    });

    expect(result.current[0]).toEqual(BILLING_CHECKOUT_SESSION_DEFAULT_VALUE);
  });

  it('should handle JSON with missing required properties', () => {
    const incompleteValue = {
      plan: BillingPlanKey.ENTERPRISE,
    };

    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        search: `?billingCheckoutSession=${encodeURIComponent(JSON.stringify(incompleteValue))}`,
      },
      writable: true,
    });

    const { result } = renderHook(() => useAtom(billingCheckoutSessionAtom), {
      wrapper: Wrapper,
    });

    expect(result.current[0]).toEqual(BILLING_CHECKOUT_SESSION_DEFAULT_VALUE);
  });

  it('should preserve other URL parameters when updating', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        search: '?otherParam=value&anotherParam=123',
      },
      writable: true,
    });

    const { result } = renderHook(() => useAtom(billingCheckoutSessionAtom), {
      wrapper: Wrapper,
    });

    const newValue = {
      plan: BillingPlanKey.ENTERPRISE,
      interval: SubscriptionInterval.Year,
      requirePaymentMethod: false,
    };

    act(() => {
      result.current[1](newValue);
    });

    expect(mockHistory.replaceState).toHaveBeenCalledWith(
      {},
      '',
      `/test?otherParam=value&anotherParam=123&billingCheckoutSession=${encodeURIComponent(JSON.stringify(newValue))}`,
    );
  });
});
