import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';

import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const mockRedirect = jest.fn();
const mockEnqueueToast = jest.fn();
const mockCheckoutSession = jest.fn();

jest.mock('@/domain-manager/hooks/useRedirect', () => ({
  useRedirect: () => ({ redirect: mockRedirect }),
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockCheckoutSession],
}));

const defaultParams = {
  recurringInterval: SubscriptionInterval.Month,
  plan: BillingPlanKey.PRO,
  requirePaymentMethod: true,
  successUrlPath: '/settings/billing',
};

// Wire shape from billingGraphqlApiExceptionHandler:
// BILLING_SUBSCRIPTION_ALREADY_EXISTS (400) → UserInputError / BAD_USER_INPUT
// with subCode + userFriendlyMessage (see billing-graphql-api-exception-handler.util.spec.ts).
const alreadySubscribedGraphQLError = new CombinedGraphQLErrors({
  errors: [
    {
      message: 'Customer already has a non-canceled billing subscription',
      extensions: {
        code: 'BAD_USER_INPUT',
        subCode: 'BILLING_SUBSCRIPTION_ALREADY_EXISTS',
        userFriendlyMessage: 'This workspace already has a subscription.',
      },
    },
  ],
});

describe('useHandleCheckoutSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to the checkout session url on success', async () => {
    mockCheckoutSession.mockResolvedValueOnce({
      data: { checkoutSession: { url: 'https://checkout.example/session' } },
    });

    const { result } = renderHook(() =>
      useHandleCheckoutSession(defaultParams),
    );

    await act(async () => {
      await result.current.handleCheckoutSession();
    });

    expect(mockCheckoutSession).toHaveBeenCalledWith({
      variables: {
        recurringInterval: SubscriptionInterval.Month,
        successUrlPath: '/settings/billing',
        plan: BillingPlanKey.PRO,
        requirePaymentMethod: true,
      },
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      'https://checkout.example/session',
    );
    expect(mockEnqueueToast).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('shows the generic toast when the checkout session url is missing', async () => {
    mockCheckoutSession.mockResolvedValueOnce({
      data: { checkoutSession: { url: null } },
    });

    const { result } = renderHook(() =>
      useHandleCheckoutSession(defaultParams),
    );

    await act(async () => {
      await result.current.handleCheckoutSession();
    });

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Checkout session error. Please retry or contact Twenty team',
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('surfaces the GraphQL userFriendlyMessage for an already-subscribed workspace', async () => {
    mockCheckoutSession.mockRejectedValueOnce(alreadySubscribedGraphQLError);

    const { result } = renderHook(() =>
      useHandleCheckoutSession(defaultParams),
    );

    await act(async () => {
      await result.current.handleCheckoutSession();
    });

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'This workspace already has a subscription.',
      action: undefined,
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('shows the generic toast for non-GraphQL errors', async () => {
    mockCheckoutSession.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() =>
      useHandleCheckoutSession(defaultParams),
    );

    await act(async () => {
      await result.current.handleCheckoutSession();
    });

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Checkout session error. Please retry or contact Twenty team',
    });
    expect(result.current.isSubmitting).toBe(false);
  });
});
