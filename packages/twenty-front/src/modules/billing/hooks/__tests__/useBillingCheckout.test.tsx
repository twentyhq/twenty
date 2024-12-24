import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { useBillingCheckout } from '@/billing/hooks/useBillingCheckout';
import { BillingPlanKey } from '~/generated/graphql';

type WrapperProps = {
  children: React.ReactNode;
  initialUrl?: string;
};

const Wrapper = ({ children, initialUrl = '' }: WrapperProps) => (
  <MemoryRouter initialEntries={[initialUrl]}>
    <RecoilRoot>{children}</RecoilRoot>
  </MemoryRouter>
);

describe('useBillingCheckout', () => {
  afterEach(() => {
    cleanup();
  });

  it('should return null as default plan', async () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => <Wrapper>{children}</Wrapper>,
    });

    await waitFor(() => {
      expect(result.current.plan).toBe(null);
    });
  });

  it('should set plan from URL parameter - FREE', async () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?plan=free">{children}</Wrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.plan).toBe(BillingPlanKey.Free);
    });
  });

  it('should set plan from URL parameter - PRO', async () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?plan=pro">{children}</Wrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.plan).toBe(BillingPlanKey.Pro);
    });
  });

  it('should set plan from URL parameter - ENTERPRISE', async () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?plan=enterprise">{children}</Wrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.plan).toBe(BillingPlanKey.Enterprise);
    });
  });

  it('should ignore invalid plan from URL parameter', async () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?plan=invalid">{children}</Wrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.plan).toBe(null);
    });
  });

  it('should handle URL without plan parameter', async () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?other=param">{children}</Wrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.plan).toBe(null);
    });
  });

  it('should set requirePaymentMethod to false when freepass parameter is present', async () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?freepass=true">{children}</Wrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.requirePaymentMethod).toBe(false);
      expect(result.current.skipPlanPage).toBe(true);
    });
  });

  it('should set requirePaymentMethod to false for all freepass parameter variations', async () => {
    const freePassVariations = [
      'freepass=true',
      'freePass=true',
      'free-pass=true',
      'Free-pass=true',
      'FreePass=true',
    ];

    for (const param of freePassVariations) {
      const { result } = renderHook(() => useBillingCheckout(), {
        wrapper: ({ children }) => (
          <Wrapper initialUrl={`?${param}`}>{children}</Wrapper>
        ),
      });

      await waitFor(() => {
        expect(result.current.requirePaymentMethod).toBe(false);
        expect(result.current.skipPlanPage).toBe(true);
      });
    }
  });

  it('should set requirePaymentMethod to false when requirePaymentMethod=true is in URL', async () => {
    const { result } = renderHook(() => useBillingCheckout(), {
      wrapper: ({ children }) => (
        <Wrapper initialUrl="?requirePaymentMethod=true">{children}</Wrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.requirePaymentMethod).toBe(false);
      expect(result.current.skipPlanPage).toBe(true);
    });
  });
});
