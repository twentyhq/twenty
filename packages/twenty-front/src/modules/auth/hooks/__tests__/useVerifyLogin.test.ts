import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { vi } from 'vitest';

import { useAuth } from '@/auth/hooks/useAuth';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: vi.fn(),
}));

vi.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: vi.fn(),
}));

dynamicActivate(SOURCE_LOCALE);

const renderHooks = () => {
  const { result } = renderHook(() => useVerifyLogin(), {
    wrapper: ({ children }) =>
      RecoilRoot({ children: I18nProvider({ i18n, children }) }),
  });
  return { result };
};

describe('useVerifyLogin', () => {
  const mockGetAuthTokensFromLoginToken = vi.fn();
  const mockEnqueueErrorSnackBar = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      getLoginTokenFromCredentials: vi.fn(),
      verifyEmailAndGetWorkspaceAgnosticToken: vi.fn(),
      verifyEmailAndGetLoginToken: vi.fn(),
      getAuthTokensFromLoginToken: mockGetAuthTokensFromLoginToken,
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
      signInWithMicrosoft: vi.fn(),
      setAuthTokens: vi.fn(),
      getAuthTokensFromOTP: vi.fn(),
    });

    vi.mocked(useSnackBar).mockReturnValue({
      handleSnackBarClose: vi.fn(),
      enqueueSuccessSnackBar: vi.fn(),
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
      enqueueInfoSnackBar: vi.fn(),
      enqueueWarningSnackBar: vi.fn(),
    });

    vi.mocked(useNavigateApp).mockReturnValue(mockNavigate);
  });

  it('should verify login token', async () => {
    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockGetAuthTokensFromLoginToken).toHaveBeenCalledWith('test-token');
  });

  it('should handle verification error', async () => {
    const error = new Error('Verification failed');
    mockGetAuthTokensFromLoginToken.mockRejectedValueOnce(error);

    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Authentication failed',
    });
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.SignInUp);
  });
});
