import { useAuth } from '@/auth/hooks/useAuth';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { renderHook } from '@testing-library/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { vi } from 'vitest';
import { BillingPlanKey, SubscriptionInterval } from '~/generated/graphql';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
  Link: vi.fn(),
}));

vi.mock('@/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useSignInWithGoogle', () => {
  const mockBillingCheckoutSession = {
    plan: BillingPlanKey.PRO,
    interval: SubscriptionInterval.Month,
    requirePaymentMethod: true,
  };

  const Wrapper = getTestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
  });

  it('should call signInWithGoogle with correct params', () => {
    const signInWithGoogleMock = vi.fn();
    const mockUseParams = { workspaceInviteHash: 'testHash' };

    const mockSearchParams = new URLSearchParams(
      'inviteToken=testToken&billingCheckoutSessionState={"plan":"Pro","interval":"Month","requirePaymentMethod":true}',
    );

    vi.mocked(useParams).mockReturnValue(mockUseParams);
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);
    vi.mocked(useAuth).mockReturnValue({
      getLoginTokenFromCredentials: vi.fn(),
      verifyEmailAndGetWorkspaceAgnosticToken: vi.fn(),
      verifyEmailAndGetLoginToken: vi.fn(),
      getAuthTokensFromLoginToken: vi.fn(),
      checkUserExists: {
        checkUserExistsData: undefined,
        checkUserExistsQuery: vi.fn(),
      },
      clearSession: vi.fn(),
      signOut: vi.fn(),
      signUpWithCredentials: vi.fn(),
      signUpWithCredentialsInWorkspace: vi.fn(),
      signInWithCredentialsInWorkspace: vi.fn(),
      signInWithCredentials: vi.fn(),
      signInWithGoogle: signInWithGoogleMock,
      signInWithMicrosoft: vi.fn(),
      setAuthTokens: vi.fn(),
      getAuthTokensFromOTP: vi.fn(),
    });

    const { result } = renderHook(() => useSignInWithGoogle(), {
      wrapper: Wrapper,
    });
    result.current.signInWithGoogle({
      action: 'join-workspace',
    });

    expect(signInWithGoogleMock).toHaveBeenCalledWith({
      action: 'join-workspace',
      workspaceInviteHash: 'testHash',
      workspacePersonalInviteToken: 'testToken',
      billingCheckoutSession: mockBillingCheckoutSession,
    });
  });

  it('should call signInWithGoogle with undefined invite token if not present', () => {
    const signInWithGoogleMock = vi.fn();
    const mockUseParams = { workspaceInviteHash: 'testHash' };
    const mockSearchParams = new URLSearchParams();

    vi.mocked(useParams).mockReturnValue(mockUseParams);
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);
    vi.mocked(useAuth).mockReturnValue({
      getLoginTokenFromCredentials: vi.fn(),
      verifyEmailAndGetWorkspaceAgnosticToken: vi.fn(),
      verifyEmailAndGetLoginToken: vi.fn(),
      getAuthTokensFromLoginToken: vi.fn(),
      checkUserExists: {
        checkUserExistsData: undefined,
        checkUserExistsQuery: vi.fn(),
      },
      clearSession: vi.fn(),
      signOut: vi.fn(),
      signUpWithCredentials: vi.fn(),
      signUpWithCredentialsInWorkspace: vi.fn(),
      signInWithCredentialsInWorkspace: vi.fn(),
      signInWithCredentials: vi.fn(),
      signInWithGoogle: signInWithGoogleMock,
      signInWithMicrosoft: vi.fn(),
      setAuthTokens: vi.fn(),
      getAuthTokensFromOTP: vi.fn(),
    });

    const { result } = renderHook(() => useSignInWithGoogle(), {
      wrapper: Wrapper,
    });
    result.current.signInWithGoogle({
      action: 'join-workspace',
    });

    expect(signInWithGoogleMock).toHaveBeenCalledWith({
      action: 'join-workspace',
      workspaceInviteHash: 'testHash',
      workspacePersonalInviteToken: undefined,
      billingCheckoutSession: mockBillingCheckoutSession,
    });
  });
});
