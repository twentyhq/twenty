import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  PublicWorkspaceDataOutput,
  useEmailPasswordResetLinkMutation,
} from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

// Mocks
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('~/generated-metadata/graphql');

dynamicActivate(SOURCE_LOCALE);

const renderHooks = () => {
  const { result } = renderHook(() => useHandleResetPassword(), {
    wrapper: ({ children }) =>
      RecoilRoot({
        initializeState: ({ set }) => {
          set(workspacePublicDataState, {
            id: 'workspace-id',
          } as PublicWorkspaceDataOutput);
        },
        children: I18nProvider({ i18n, children }),
      }),
  });
  return { result };
};

describe('useHandleResetPassword', () => {
  const enqueueSnackBarMock = jest.fn();
  const emailPasswordResetLinkMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueSnackBar: enqueueSnackBarMock,
    });
    (useEmailPasswordResetLinkMutation as jest.Mock).mockReturnValue([
      emailPasswordResetLinkMock,
    ]);
  });

  it('should show error message if email is invalid', async () => {
    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('')());

    expect(enqueueSnackBarMock).toHaveBeenCalledWith('Invalid email', {
      variant: SnackBarVariant.Error,
    });
  });

  it('should show success message if password reset link is sent', async () => {
    emailPasswordResetLinkMock.mockResolvedValue({
      data: { emailPasswordResetLink: { success: true } },
    });

    const { result } = renderHooks();
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

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(enqueueSnackBarMock).toHaveBeenCalledWith('There was an issue', {
      variant: SnackBarVariant.Error,
    });
  });

  it('should show error message in case of request error', async () => {
    const errorMessage = 'Network Error';
    emailPasswordResetLinkMock.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(enqueueSnackBarMock).toHaveBeenCalledWith(errorMessage, {
      variant: SnackBarVariant.Error,
    });
  });
});
