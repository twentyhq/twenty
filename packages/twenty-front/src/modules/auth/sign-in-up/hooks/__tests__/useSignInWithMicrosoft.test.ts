import { renderHook } from '@testing-library/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('useSignInWithMicrosoft', () => {
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

    const { result } = renderHook(() => useSignInWithMicrosoft());
    result.current.signInWithMicrosoft();

    expect(signInWithMicrosoftMock).toHaveBeenCalledWith({
      workspaceInviteHash: workspaceInviteHashMock,
      workspacePersonalInviteToken: inviteTokenMock,
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

    const { result } = renderHook(() => useSignInWithMicrosoft());
    result.current.signInWithMicrosoft();

    expect(signInWithMicrosoftMock).toHaveBeenCalledWith({
      workspaceInviteHash: workspaceInviteHashMock,
      workspacePersonalInviteToken: undefined,
    });
  });
});
