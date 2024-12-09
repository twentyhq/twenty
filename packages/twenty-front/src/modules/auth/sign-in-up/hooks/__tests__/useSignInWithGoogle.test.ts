import { renderHook } from '@testing-library/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('useSignInWithGoogle', () => {
  it('should call signInWithGoogle with correct params', () => {
    const signInWithGoogleMock = jest.fn();
    const mockUseParams = { workspaceInviteHash: 'testHash' };
    const mockSearchParams = new URLSearchParams('inviteToken=testToken');

    (useParams as jest.Mock).mockReturnValue(mockUseParams);
    (useSearchParams as jest.Mock).mockReturnValue([mockSearchParams]);
    (useAuth as jest.Mock).mockReturnValue({
      signInWithGoogle: signInWithGoogleMock,
    });

    const { result } = renderHook(() => useSignInWithGoogle());
    result.current.signInWithGoogle();

    expect(signInWithGoogleMock).toHaveBeenCalledWith({
      workspaceInviteHash: 'testHash',
      workspacePersonalInviteToken: 'testToken',
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

    const { result } = renderHook(() => useSignInWithGoogle());
    result.current.signInWithGoogle();

    expect(signInWithGoogleMock).toHaveBeenCalledWith({
      workspaceInviteHash: 'testHash',
      workspacePersonalInviteToken: undefined,
    });
  });
});
