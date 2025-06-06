import { useAuth } from '@/auth/hooks/useAuth';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { renderHook } from '@testing-library/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
  Link: jest.fn(),
}));

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('useSignInWithMicrosoft', () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
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
    const signInWithMicrosoftMock = jest.fn();

    (useParams as jest.Mock).mockReturnValue({
      workspaceInviteHash: workspaceInviteHashMock,
    });
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(`inviteToken=${inviteTokenMock}`),
    ]);
    (useAuth as jest.Mock).mockReturnValue({
      signInWithMicrosoft: signInWithMicrosoftMock,
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
    const signInWithMicrosoftMock = jest.fn();

    (useParams as jest.Mock).mockReturnValue({
      workspaceInviteHash: workspaceInviteHashMock,
    });
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams('')]);
    (useAuth as jest.Mock).mockReturnValue({
      signInWithMicrosoft: signInWithMicrosoftMock,
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
