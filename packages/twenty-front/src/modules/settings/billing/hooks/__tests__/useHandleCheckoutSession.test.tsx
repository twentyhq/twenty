import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { type ReactNode } from 'react';

import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import {
  BillingPlanKey,
  CheckoutSessionDocument,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const mockRedirect = jest.fn();
const mockEnqueueToast = jest.fn();

jest.mock('@/domain-manager/hooks/useRedirect', () => ({
  useRedirect: () => ({ redirect: mockRedirect }),
}));

jest.mock('twenty-ui/primitives/feedback', () => ({
  ...jest.requireActual('twenty-ui/primitives/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const SUCCESS_URL = 'https://billing.example/success';

const baseVariables = {
  recurringInterval: SubscriptionInterval.Month,
  successUrlPath: '/plan-required/success',
  plan: BillingPlanKey.PRO,
  requirePaymentMethod: false,
};

const buildSuccessMock = (): MockedResponse => ({
  request: {
    query: CheckoutSessionDocument,
    variables: baseVariables,
  },
  result: {
    data: {
      checkoutSession: { url: SUCCESS_URL },
    },
  },
});

const buildMissingUrlMock = (): MockedResponse => ({
  request: {
    query: CheckoutSessionDocument,
    variables: baseVariables,
  },
  result: {
    data: {
      checkoutSession: { url: null },
    },
  },
});

const buildAlreadySubscribedMock = (): MockedResponse => ({
  request: {
    query: CheckoutSessionDocument,
    variables: baseVariables,
  },
  result: {
    errors: [
      new GraphQLError('Customer already has a non-canceled subscription', {
        extensions: {
          code: 'BAD_USER_INPUT',
          subCode: 'BILLING_SUBSCRIPTION_ALREADY_EXISTS',
          userFriendlyMessage: 'This workspace already has a subscription.',
        },
      }),
    ],
  },
});

const buildWrapper =
  (mocks: MockedResponse[]) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useHandleCheckoutSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects when checkoutSession returns a url', async () => {
    const { result } = renderHook(
      () => useHandleCheckoutSession(baseVariables),
      { wrapper: buildWrapper([buildSuccessMock()]) },
    );

    await act(async () => {
      await result.current.handleCheckoutSession();
    });

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith(SUCCESS_URL);
    });
    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('shows a generic error toast when the url is missing', async () => {
    const { result } = renderHook(
      () => useHandleCheckoutSession(baseVariables),
      { wrapper: buildWrapper([buildMissingUrlMock()]) },
    );

    await act(async () => {
      await result.current.handleCheckoutSession();
    });

    await waitFor(() => {
      expect(mockEnqueueToast).toHaveBeenCalledWith({
        variant: 'error',
        children: 'Checkout session error. Please retry or contact Twenty team',
      });
    });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('surfaces BILLING_SUBSCRIPTION_ALREADY_EXISTS instead of a generic toast', async () => {
    const { result } = renderHook(
      () => useHandleCheckoutSession(baseVariables),
      { wrapper: buildWrapper([buildAlreadySubscribedMock()]) },
    );

    await act(async () => {
      await result.current.handleCheckoutSession();
    });

    await waitFor(() => {
      expect(mockEnqueueToast).toHaveBeenCalled();
    });

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'error',
        children: 'This workspace already has a subscription.',
      }),
    );
    expect(mockEnqueueToast).not.toHaveBeenCalledWith(
      expect.objectContaining({
        children: 'Checkout session error. Please retry or contact Twenty team',
      }),
    );
  });
});
