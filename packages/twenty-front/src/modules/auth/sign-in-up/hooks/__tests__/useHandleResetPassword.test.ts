import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode, createElement } from 'react';

import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useCaptcha } from '@/client-config/hooks/useCaptcha';

import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useMutation } from '@apollo/client/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { type PublicWorkspaceData } from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const mockEnqueueToast = jest.fn();
const mockEnqueueErrorToast = jest.fn();

jest.mock('twenty-ui/feedback', () => ({
  ...jest.requireActual('twenty-ui/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));
jest.mock('@/error-handler/hooks/useErrorToast', () => ({
  useErrorToast: () => ({ enqueueErrorToast: mockEnqueueErrorToast }),
}));
jest.mock('@apollo/client/react');
jest.mock('@/captcha/hooks/useReadCaptchaToken');
jest.mock('@/client-config/hooks/useCaptcha');

dynamicActivate(SOURCE_LOCALE);

const renderHooks = () => {
  jotaiStore.set(workspacePublicDataState.atom, {
    id: 'workspace-id',
  } as PublicWorkspaceData);

  const { result } = renderHook(() => useHandleResetPassword(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        JotaiProvider,
        { store: jotaiStore },
        createElement(I18nProvider, { i18n }, children),
      ),
  });
  return { result };
};

const renderHooksWithoutWorkspace = () => {
  jotaiStore.set(workspacePublicDataState.atom, null);

  const { result } = renderHook(() => useHandleResetPassword(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        JotaiProvider,
        { store: jotaiStore },
        createElement(I18nProvider, { i18n }, children),
      ),
  });
  return { result };
};

describe('useHandleResetPassword', () => {
  const emailPasswordResetLinkMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMutation as unknown as jest.Mock).mockReturnValue([
      emailPasswordResetLinkMock,
    ]);
    (useCaptcha as jest.Mock).mockReturnValue({ isCaptchaReady: true });
    (useReadCaptchaToken as jest.Mock).mockReturnValue({
      readCaptchaToken: () => 'mock-captcha-token',
    });
  });

  it('should show error message if email is invalid', async () => {
    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('')());

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Invalid email',
    });
  });

  it('should show success message if password reset link is sent', async () => {
    emailPasswordResetLinkMock.mockResolvedValue({
      data: { emailPasswordResetLink: { success: true } },
    });

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(emailPasswordResetLinkMock).toHaveBeenCalledWith({
      variables: {
        email: 'test@example.com',
        workspaceId: 'workspace-id',
        captchaToken: 'mock-captcha-token',
      },
    });
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'success',
      children:
        'If this email is registered, a password reset link has been sent',
    });
  });

  it('should send reset link without workspaceId if workspace context is missing', async () => {
    emailPasswordResetLinkMock.mockResolvedValue({
      data: { emailPasswordResetLink: { success: true } },
    });

    const { result } = renderHooksWithoutWorkspace();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(emailPasswordResetLinkMock).toHaveBeenCalledWith({
      variables: {
        email: 'test@example.com',
        captchaToken: 'mock-captcha-token',
      },
    });
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'success',
      children:
        'If this email is registered, a password reset link has been sent',
    });
  });

  it('should show error message if captcha is not ready', async () => {
    (useCaptcha as jest.Mock).mockReturnValue({ isCaptchaReady: false });

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Captcha (anti-bot check) is still loading, try again',
    });
    expect(emailPasswordResetLinkMock).not.toHaveBeenCalled();
  });

  it('should show error message if sending reset link fails', async () => {
    emailPasswordResetLinkMock.mockResolvedValue({
      data: { emailPasswordResetLink: { success: false } },
    });

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'An error occurred.',
    });
  });

  it('should show error message in case of request error', async () => {
    const errorMessage = 'Network Error';
    emailPasswordResetLinkMock.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHooks();
    await act(() => result.current.handleResetPassword('test@example.com')());

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: errorMessage,
    });
  });
});
