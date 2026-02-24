import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { RecoilRoot } from 'recoil';

import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  type PublicWorkspaceDataOutput,
  useEmailPasswordResetLinkMutation,
} from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

// Mocks
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('~/generated-metadata/graphql');

dynamicActivate(SOURCE_LOCALE);

const renderHooks = () => {
  jotaiStore.set(workspacePublicDataState.atom, {
    id: 'workspace-id',
  } as PublicWorkspaceDataOutput);

  const { result } = renderHook(() => useHandleResetPassword(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        JotaiProvider,
        { store: jotaiStore },
        createElement(
          RecoilRoot,
          null as any,
          createElement(I18nProvider, { i18n }, children),
        ),
      ),
  });
  return { result };
};

describe('useHandleResetPassword', () => {
  const enqueueErrorSnackBarMock = jest.fn();
  const enqueueSuccessSnackBarMock = jest.fn();
  const emailPasswordResetLinkMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueErrorSnackBar: enqueueErrorSnackBarMock,
      enqueueSuccessSnackBar: enqueueSuccessSnackBarMock,
    });
    (useEmailPasswordResetLinkMutation as jest.Mock).mockReturnValue([
      emailPasswordResetLinkMock,
    ]);
  });

  it('should show error message if email is invalid', async () => {
    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('')());

    expect(enqueueErrorSnackBarMock).toHaveBeenCalledWith({
      message: 'Invalid email',
    });
  });

  it('should show success message if password reset link is sent', async () => {
    emailPasswordResetLinkMock.mockResolvedValue({
      data: { emailPasswordResetLink: { success: true } },
    });

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(enqueueSuccessSnackBarMock).toHaveBeenCalledWith({
      message: 'Password reset link has been sent to the email',
    });
  });

  it('should show error message if sending reset link fails', async () => {
    emailPasswordResetLinkMock.mockResolvedValue({
      data: { emailPasswordResetLink: { success: false } },
    });

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(enqueueErrorSnackBarMock).toHaveBeenCalledWith({});
  });

  it('should show error message in case of request error', async () => {
    const errorMessage = 'Network Error';
    emailPasswordResetLinkMock.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(enqueueErrorSnackBarMock).toHaveBeenCalledWith({});
  });
});
