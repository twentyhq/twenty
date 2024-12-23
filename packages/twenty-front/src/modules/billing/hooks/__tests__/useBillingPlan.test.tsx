import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { useBillingCheckout } from '@/billing/hooks/useBillingCheckout';
import { BillingPlanKey } from '~/generated/graphql';

const Wrapper = ({ children, initialUrl = '' }: any) => (
  <MemoryRouter initialEntries={[initialUrl]}>
    <RecoilRoot>{children}</RecoilRoot>
  </MemoryRouter>
);

describe('useBillingCheckout', () => {
  it('should return null as default plan', () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: Wrapper,
    });

    expect(result.current.plan).toBe(null);
  });

  it('should set plan from URL parameter - FREE', () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?plan=free">{children}</Wrapper>
      ),
    });

    expect(result.current.plan).toBe(BillingPlanKey.Free);
  });

  it('should set plan from URL parameter - PRO', () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?plan=pro">{children}</Wrapper>
      ),
    });

    expect(result.current.plan).toBe(BillingPlanKey.Pro);
  });

  it('should set plan from URL parameter - ENTERPRISE', () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?plan=enterprise">{children}</Wrapper>
      ),
    });

    expect(result.current.plan).toBe(BillingPlanKey.Enterprise);
  });

  it('should ignore invalid plan from URL parameter', () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?plan=invalid">{children}</Wrapper>
      ),
    });

    expect(result.current.plan).toBe(null);
  });

  it('should handle URL without plan parameter', () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?other=param">{children}</Wrapper>
      ),
    });

    expect(result.current.plan).toBe(null);
  });
});
