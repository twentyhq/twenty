import { MockedProvider } from '@apollo/client/testing';
import { act, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { CHECKOUT_SESSION } from '@/billing/graphql/checkoutSession';
import { BillingPlanKey } from '@/billing/types/billing';
import { AppPath } from '@/types/AppPath';
import { SubscriptionInterval } from '~/generated/graphql';
import { PlanCheckoutEffect } from '../PlanCheckoutEffect';

const mockEnqueueSnackBar = jest.fn();
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSnackBar: mockEnqueueSnackBar,
  }),
}));

const mockBillingPlan = jest.fn();
jest.mock('@/billing/hooks/useBillingPlan', () => ({
  useBillingPlan: () => mockBillingPlan(),
}));

const mockReplace = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    replace: mockReplace,
  },
  writable: true,
});

describe('PlanCheckoutEffect', () => {
  const mockCheckoutUrl = 'https://checkout.stripe.com/test';

  const successMock = {
    request: {
      query: CHECKOUT_SESSION,
      variables: {
        recurringInterval: SubscriptionInterval.Month,
        successUrlPath: AppPath.PlanRequiredSuccess,
        plan: BillingPlanKey.PRO,
      },
    },
    result: {
      data: {
        checkoutSession: {
          url: mockCheckoutUrl,
        },
      },
    },
  };

  const errorMock = {
    request: {
      query: CHECKOUT_SESSION,
      variables: {
        recurringInterval: SubscriptionInterval.Month,
        successUrlPath: AppPath.PlanRequiredSuccess,
        plan: BillingPlanKey.PRO,
      },
    },
    error: new Error('Checkout session error'),
  };

  beforeEach(() => {
    mockBillingPlan.mockReturnValue(BillingPlanKey.PRO);
    mockEnqueueSnackBar.mockClear();
    mockReplace.mockClear();
  });

  it('should redirect to checkout URL on successful session creation', async () => {
    render(
      <MockedProvider mocks={[successMock]} addTypename={false}>
        <BrowserRouter>
          <RecoilRoot>
            <PlanCheckoutEffect />
          </RecoilRoot>
        </BrowserRouter>
      </MockedProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockReplace).toHaveBeenCalledWith(mockCheckoutUrl);
    expect(mockEnqueueSnackBar).not.toHaveBeenCalled();
  });

  it('should show error snackbar when checkout session creation fails', async () => {
    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <BrowserRouter>
          <RecoilRoot>
            <PlanCheckoutEffect />
          </RecoilRoot>
        </BrowserRouter>
      </MockedProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockEnqueueSnackBar).toHaveBeenCalledWith(
      'Error creating checkout session',
      { variant: 'error' },
    );
  });

  it('should show error snackbar when checkout URL is missing', async () => {
    const noUrlMock = {
      ...successMock,
      result: {
        data: {
          checkoutSession: {
            url: null,
          },
        },
      },
    };

    render(
      <MockedProvider mocks={[noUrlMock]} addTypename={false}>
        <BrowserRouter>
          <RecoilRoot>
            <PlanCheckoutEffect />
          </RecoilRoot>
        </BrowserRouter>
      </MockedProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockEnqueueSnackBar).toHaveBeenCalledWith(
      'Checkout session error. Please retry or contact Twenty team',
      { variant: 'error' },
    );
  });
});
