import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useAuth } from '../useAuth';
import { useVerifyLogin } from '../useVerifyLogin';

import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

jest.mock('../useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: jest.fn(),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: jest.fn(),
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
  const mockGetAuthTokensFromLoginToken = jest.fn();
  const mockEnqueueSnackBar = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      getAuthTokensFromLoginToken: mockGetAuthTokensFromLoginToken,
    });

    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueSnackBar: mockEnqueueSnackBar,
    });

    (useNavigateApp as jest.Mock).mockReturnValue(mockNavigate);
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

    expect(mockEnqueueSnackBar).toHaveBeenCalledWith('Authentication failed', {
      variant: SnackBarVariant.Error,
    });
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.SignInUp);
  });
});
