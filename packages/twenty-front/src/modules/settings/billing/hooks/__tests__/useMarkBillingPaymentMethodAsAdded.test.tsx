import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useMarkBillingPaymentMethodAsAdded } from '@/settings/billing/hooks/useMarkBillingPaymentMethodAsAdded';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderMarkBillingPaymentMethodAsAdded = () =>
  renderHook(() => useMarkBillingPaymentMethodAsAdded(), { wrapper: Wrapper });

describe('useMarkBillingPaymentMethodAsAdded', () => {
  it('should mark the billing customer of the current workspace as having a payment method', () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      id: '1',
      billingCustomer: {
        id: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        hasPaymentMethod: false,
      },
    } as CurrentWorkspace);

    const { result } = renderMarkBillingPaymentMethodAsAdded();

    act(() => {
      result.current.markBillingPaymentMethodAsAdded();
    });

    expect(
      jotaiStore.get(currentWorkspaceState.atom)?.billingCustomer
        ?.hasPaymentMethod,
    ).toBe(true);
  });

  it('should leave the current workspace untouched when it has no billing customer', () => {
    const workspaceWithoutBillingCustomer = {
      id: '1',
      billingCustomer: null,
    } as CurrentWorkspace;

    jotaiStore.set(currentWorkspaceState.atom, workspaceWithoutBillingCustomer);

    const { result } = renderMarkBillingPaymentMethodAsAdded();

    act(() => {
      result.current.markBillingPaymentMethodAsAdded();
    });

    expect(jotaiStore.get(currentWorkspaceState.atom)).toEqual(
      workspaceWithoutBillingCustomer,
    );
  });
});
