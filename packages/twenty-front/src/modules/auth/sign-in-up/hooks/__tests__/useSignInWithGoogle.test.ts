import { useAuth } from '@/auth/hooks/useAuth';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { renderHook } from '@testing-library/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { BillingPlanKey, SubscriptionInterval } from '~/generated/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('useSignInWithGoogle', () => {
  const mockBillingCheckoutSession = {
    plan: BillingPlanKey.Pro,
    interval: SubscriptionInterval.Month,
    requirePaymentMethod: true,
  };

  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
  });

  it('should call signInWithGoogle with correct params', () => {
    const signInWithGoogleMock = jest.fn();
    const mockUseParams = { workspaceInviteHash: 'testHash' };

    const mockSearchParams = new URLSearchParams(
      'inviteToken=testToken&billingCheckoutSessionState={"plan":"Pro","interval":"Month","requirePaymentMethod":true}',
    );

    (useParams as jest.Mock).mockReturnValue(mockUseParams);
    (useSearchParams as jest.Mock).mockReturnValue([mockSearchParams]);
    (useAuth as jest.Mock).mockReturnValue({
      signInWithGoogle: signInWithGoogleMock,
    });

    const { result } = renderHook(() => useSignInWithGoogle(), {
      wrapper: Wrapper,
    });
    result.current.signInWithGoogle();

    expect(signInWithGoogleMock).toHaveBeenCalledWith({
      workspaceInviteHash: 'testHash',
      workspacePersonalInviteToken: 'testToken',
      billingCheckoutSession: mockBillingCheckoutSession,
    });
  });

  it('should call signInWithGoogle with undefined invite token if not present', () => {
    const signInWithGoogleMock = jest.fn();
    const mockUseParams = { workspaceInviteHash: 'testHash' };
    const mockSearchParams = new URLSearchParams();

    (useParams as jest.Mock).mockReturnValue(mockUseParams);
    (useSearchParams as jest.Mock).mockReturnValue([mockSearchParams]);
    (useAuth as jest.Mock).mockReturnValue({
      signInWithGoogle: signInWithGoogleMock,
    });

    const { result } = renderHook(() => useSignInWithGoogle(), {
      wrapper: Wrapper,
    });
    result.current.signInWithGoogle();

    expect(signInWithGoogleMock).toHaveBeenCalledWith({
      workspaceInviteHash: 'testHash',
      workspacePersonalInviteToken: undefined,
      billingCheckoutSession: mockBillingCheckoutSession,
    });
  });
});
