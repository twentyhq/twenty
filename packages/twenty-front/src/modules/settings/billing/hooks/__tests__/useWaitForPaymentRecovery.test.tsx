import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { PAYMENT_RECOVERY_POLLING_MAX_ATTEMPTS } from '@/settings/billing/constants/PaymentRecoveryPollingMaxAttempts';
import { useWaitForPaymentRecovery } from '@/settings/billing/hooks/useWaitForPaymentRecovery';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

const mockQuery = jest.fn();
const mockLoadCurrentUser = jest.fn();
const mockEnqueueSuccessSnackBar = jest.fn();
const mockEnqueueWarningSnackBar = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ query: mockQuery }),
}));

jest.mock('@/users/hooks/useLoadCurrentUser', () => ({
  useLoadCurrentUser: () => ({ loadCurrentUser: mockLoadCurrentUser }),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSuccessSnackBar: mockEnqueueSuccessSnackBar,
    enqueueWarningSnackBar: mockEnqueueWarningSnackBar,
  }),
}));

jest.mock('~/utils/sleep', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const buildWorkspaceBillingResponse = (
  subscriptionStatus: SubscriptionStatus,
) => ({
  data: {
    currentUser: {
      currentWorkspace: {
        currentBillingSubscription: {
          id: 'subscription-1',
          status: subscriptionStatus,
          metadata: {},
          phases: [],
        },
        billingSubscriptions: [
          {
            id: 'subscription-1',
            status: subscriptionStatus,
            metadata: {},
            phases: [],
          },
        ],
      },
    },
  },
});

const runWaitForPaymentRecovery = async () => {
  const { result } = renderHook(() => useWaitForPaymentRecovery(), {
    wrapper: Wrapper,
  });

  await act(async () => {
    await result.current.waitForPaymentRecovery();
  });
};

describe('useWaitForPaymentRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadCurrentUser.mockResolvedValue(undefined);

    jotaiStore.set(currentWorkspaceState.atom, {
      id: '1',
      billingCustomer: { id: 'customer-1', hasPaymentMethod: false },
      currentBillingSubscription: {
        id: 'subscription-1',
        status: SubscriptionStatus.PastDue,
        metadata: {},
        phases: [],
      },
    } as unknown as CurrentWorkspace);
  });

  it('should keep polling while the payment is overdue and report success once the subscription is active', async () => {
    mockQuery
      .mockResolvedValueOnce(
        buildWorkspaceBillingResponse(SubscriptionStatus.PastDue),
      )
      .mockResolvedValueOnce(
        buildWorkspaceBillingResponse(SubscriptionStatus.Active),
      );

    await runWaitForPaymentRecovery();

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockLoadCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledWith({
      message: 'Payment successful.',
    });
    expect(mockEnqueueWarningSnackBar).not.toHaveBeenCalled();
    expect(
      jotaiStore.get(currentWorkspaceState.atom)?.billingCustomer
        ?.hasPaymentMethod,
    ).toBe(true);
  });

  it('should still reflect the recovered subscription when the full refresh fails', async () => {
    mockQuery.mockResolvedValueOnce(
      buildWorkspaceBillingResponse(SubscriptionStatus.Active),
    );
    mockLoadCurrentUser.mockRejectedValueOnce(new Error('Network error'));

    await runWaitForPaymentRecovery();

    expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledTimes(1);
    expect(
      jotaiStore.get(currentWorkspaceState.atom)?.currentBillingSubscription
        ?.status,
    ).toBe(SubscriptionStatus.Active);
  });

  it('should skip a failed fetch and keep polling', async () => {
    mockQuery
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(
        buildWorkspaceBillingResponse(SubscriptionStatus.Active),
      );

    await runWaitForPaymentRecovery();

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledTimes(1);
  });

  it('should warn and point to billing when the payment is still overdue after the last attempt', async () => {
    mockQuery.mockResolvedValue(
      buildWorkspaceBillingResponse(SubscriptionStatus.PastDue),
    );

    await runWaitForPaymentRecovery();

    expect(mockQuery).toHaveBeenCalledTimes(
      PAYMENT_RECOVERY_POLLING_MAX_ATTEMPTS,
    );
    expect(mockLoadCurrentUser).not.toHaveBeenCalled();
    expect(mockEnqueueSuccessSnackBar).not.toHaveBeenCalled();
    expect(mockEnqueueWarningSnackBar).toHaveBeenCalledWith({
      message: 'Your card was saved, but the payment still needs attention.',
      options: {
        buttonLabel: 'Go to billing',
        buttonTo: getSettingsPath(SettingsPath.Billing),
      },
    });
  });

  it('should stop polling and warn as soon as the subscription can no longer recover', async () => {
    mockQuery.mockResolvedValue(
      buildWorkspaceBillingResponse(SubscriptionStatus.Canceled),
    );

    await runWaitForPaymentRecovery();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockEnqueueSuccessSnackBar).not.toHaveBeenCalled();
    expect(mockEnqueueWarningSnackBar).toHaveBeenCalledTimes(1);
  });
});
