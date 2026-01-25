import { useAuth } from '@/auth/hooks/useAuth';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { renderHook } from '@testing-library/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { vi } from 'vitest';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
  Link: vi.fn(),
}));

vi.mock('@/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useSignInWithMicrosoft', () => {
  const Wrapper = getTestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
  });

  const mockBillingCheckoutSession = {
    plan: 'PRO',
    interval: 'Month',
    requirePaymentMethod: true,
  };

  it('should call signInWithMicrosoft with the correct parameters', () => {
    const workspaceInviteHashMock = 'testHash';
    const inviteTokenMock = 'testToken';
    const signInWithMicrosoftMock = vi.fn();

    vi.mocked(useParams).mockReturnValue({
      workspaceInviteHash: workspaceInviteHashMock,
    });
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(`inviteToken=${inviteTokenMock}`),
      vi.fn(),
    ]);
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
      signInWithGoogle: vi.fn(),
      signInWithMicrosoft: signInWithMicrosoftMock,
      setAuthTokens: vi.fn(),
      getAuthTokensFromOTP: vi.fn(),
    });

    const { result } = renderHook(() => useSignInWithMicrosoft(), {
      wrapper: Wrapper,
    });
    result.current.signInWithMicrosoft({
      action: 'join-workspace',
    });

    expect(signInWithMicrosoftMock).toHaveBeenCalledWith({
      action: 'join-workspace',
      workspaceInviteHash: workspaceInviteHashMock,
      workspacePersonalInviteToken: inviteTokenMock,
      billingCheckoutSession: mockBillingCheckoutSession,
    });
  });

  it('should handle missing inviteToken gracefully', () => {
    const workspaceInviteHashMock = 'testHash';
    const signInWithMicrosoftMock = vi.fn();

    vi.mocked(useParams).mockReturnValue({
      workspaceInviteHash: workspaceInviteHashMock,
    });
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(''),
      vi.fn(),
    ]);
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
      signInWithGoogle: vi.fn(),
      signInWithMicrosoft: signInWithMicrosoftMock,
      setAuthTokens: vi.fn(),
      getAuthTokensFromOTP: vi.fn(),
    });

    const { result } = renderHook(() => useSignInWithMicrosoft(), {
      wrapper: Wrapper,
    });
    result.current.signInWithMicrosoft({
      action: 'join-workspace',
    });

    expect(signInWithMicrosoftMock).toHaveBeenCalledWith({
      action: 'join-workspace',
      billingCheckoutSession: mockBillingCheckoutSession,
      workspaceInviteHash: workspaceInviteHashMock,
      workspacePersonalInviteToken: undefined,
    });
  });
});
