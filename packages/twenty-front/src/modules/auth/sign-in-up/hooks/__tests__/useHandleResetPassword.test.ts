import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { vi } from 'vitest';

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  type PublicWorkspaceDataOutput,
  useEmailPasswordResetLinkMutation,
} from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

// Mocks
vi.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: vi.fn(),
}));
vi.mock('~/generated-metadata/graphql', () => ({
  useEmailPasswordResetLinkMutation: vi.fn(),
}));

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
  const enqueueErrorSnackBarMock = vi.fn();
  const enqueueSuccessSnackBarMock = vi.fn();
  const emailPasswordResetLinkMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSnackBar).mockReturnValue({
      handleSnackBarClose: vi.fn(),
      enqueueSuccessSnackBar: enqueueSuccessSnackBarMock,
      enqueueErrorSnackBar: enqueueErrorSnackBarMock,
      enqueueInfoSnackBar: vi.fn(),
      enqueueWarningSnackBar: vi.fn(),
    });
    const mockApolloClient = new ApolloClient({
      uri: 'http://localhost',
      cache: new InMemoryCache(),
    });
    vi.mocked(useEmailPasswordResetLinkMutation).mockReturnValue([
      emailPasswordResetLinkMock,
      {
        data: undefined,
        loading: false,
        error: undefined,
        called: false,
        reset: vi.fn(),
        client: mockApolloClient,
      },
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
