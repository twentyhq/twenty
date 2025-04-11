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

// Mock the window.location and history API
const mockLocation = {
  pathname: '/test',
  search: '',
};

const mockHistory = {
  replaceState: jest.fn(),
};

// Setup the test environment
const setupTest = () => {
  // Mock window.location and history
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });

  Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true,
  });

  // Reset mocks
  jest.clearAllMocks();
};

// Wrapper component for the tests
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
    // Set up URL with billingCheckoutSession param
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

    // Check that history.replaceState was called with the correct URL
    expect(mockHistory.replaceState).toHaveBeenCalledWith(
      {},
      '',
      `/test?billingCheckoutSession=${encodeURIComponent(JSON.stringify(newValue))}`,
    );
  });

  it('should handle invalid JSON in URL params', () => {
    // Set up URL with invalid JSON
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

    // Should fall back to default value
    expect(result.current[0]).toEqual(BILLING_CHECKOUT_SESSION_DEFAULT_VALUE);
  });

  it('should handle JSON with missing required properties', () => {
    // Set up URL with incomplete JSON
    const incompleteValue = {
      plan: BillingPlanKey.ENTERPRISE,
      // Missing interval and requirePaymentMethod
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

    // Should fall back to default value
    expect(result.current[0]).toEqual(BILLING_CHECKOUT_SESSION_DEFAULT_VALUE);
  });

  it('should preserve other URL parameters when updating', () => {
    // Set up URL with multiple params
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

    // Check that other params are preserved
    expect(mockHistory.replaceState).toHaveBeenCalledWith(
      {},
      '',
      `/test?otherParam=value&anotherParam=123&billingCheckoutSession=${encodeURIComponent(JSON.stringify(newValue))}`,
    );
  });
});
