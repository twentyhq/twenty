import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import Cookies from 'js-cookie';
import { type ReactNode } from 'react';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { useHandleResendEmailVerificationToken } from '@/auth/sign-in-up/hooks/useHandleResendEmailVerificationToken';
import { ResendEmailVerificationTokenDocument } from '~/generated-metadata/graphql';

jest.mock('@/domain-manager/hooks/useOrigin', () => ({
  useOrigin: jest.fn().mockImplementation(() => ({
    origin: 'http://localhost',
  })),
}));

const resendResult = jest.fn(() => ({
  data: {
    resendEmailVerificationToken: {
      __typename: 'ResendEmailVerificationToken',
      success: true,
    },
  },
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: ResendEmailVerificationTokenDocument,
          variables: () => true,
        },
        result: resendResult,
      },
    ]}
  >
    <ToastProvider>{children}</ToastProvider>
  </MockedProvider>
);

describe('useHandleResendEmailVerificationToken', () => {
  afterEach(() => {
    Cookies.remove('partner');
  });

  it('should send a partner stored by another tab with the resend', async () => {
    const { result } = renderHook(
      () => useHandleResendEmailVerificationToken(),
      { wrapper: Wrapper },
    );

    Cookies.set('partner', JSON.stringify({ partner: 'northwind' }));

    await act(async () => {
      await result.current.handleResendEmailVerificationToken(
        'tim@apple.dev',
      )();
    });

    expect(resendResult).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'tim@apple.dev',
        partner: 'northwind',
      }),
    );
  });
});
