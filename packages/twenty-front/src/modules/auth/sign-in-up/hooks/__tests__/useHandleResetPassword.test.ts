import { act, renderHook } from '@testing-library/react';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

// Mocks
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('~/generated/graphql');

describe('useHandleResetPassword', () => {
  const enqueueSnackBarMock = jest.fn();
  const emailPasswordResetLinkMock = jest.fn();

  beforeEach(() => {
    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueSnackBar: enqueueSnackBarMock,
    });
    (useEmailPasswordResetLinkMutation as jest.Mock).mockReturnValue([
      emailPasswordResetLinkMock,
    ]);
    jest.clearAllMocks();
  });

  it('should show error message if email is invalid', async () => {
    const { result } = renderHook(() => useHandleResetPassword());
    await act(() => result.current.handleResetPassword('')());

    expect(enqueueSnackBarMock).toHaveBeenCalledWith('Invalid email', {
      variant: SnackBarVariant.Error,
    });
  });

  it('should show success message if password reset link is sent', async () => {
    emailPasswordResetLinkMock.mockResolvedValue({
      data: { emailPasswordResetLink: { success: true } },
    });

    const { result } = renderHook(() => useHandleResetPassword());
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(enqueueSnackBarMock).toHaveBeenCalledWith(
      'Password reset link has been sent to the email',
      { variant: SnackBarVariant.Success },
    );
  });

  it('should show error message if sending reset link fails', async () => {
    emailPasswordResetLinkMock.mockResolvedValue({
      data: { emailPasswordResetLink: { success: false } },
    });

    const { result } = renderHook(() => useHandleResetPassword());
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(enqueueSnackBarMock).toHaveBeenCalledWith('There was some issue', {
      variant: SnackBarVariant.Error,
    });
  });

  it('should show error message in case of request error', async () => {
    const errorMessage = 'Network Error';
    emailPasswordResetLinkMock.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useHandleResetPassword());
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(enqueueSnackBarMock).toHaveBeenCalledWith(errorMessage, {
      variant: SnackBarVariant.Error,
    });
  });
});
