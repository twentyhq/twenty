import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { captchaState } from '@/client-config/states/captchaState';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

// Mock the isCaptchaRequiredForPath function
jest.mock('@/captcha/utils/isCaptchaRequiredForPath');

describe('useRequestFreshCaptchaToken', () => {
  // Setup mocks for window.grecaptcha and window.turnstile
  const mockGrecaptchaExecute = jest.fn();
  const mockTurnstileRender = jest.fn();
  const mockTurnstileExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.grecaptcha
    window.grecaptcha = {
      execute: mockGrecaptchaExecute,
    };

    // Mock window.turnstile
    window.turnstile = {
      render: mockTurnstileRender,
      execute: mockTurnstileExecute,
    };

    // Default mock for isCaptchaRequiredForPath
    (isCaptchaRequiredForPath as jest.Mock).mockReturnValue(true);

    // Setup mock implementations
    mockGrecaptchaExecute.mockImplementation((siteKey, options) => {
      return Promise.resolve('google-recaptcha-token');
    });

    mockTurnstileRender.mockImplementation((selector, options) => {
      return 'turnstile-widget-id';
    });

    mockTurnstileExecute.mockImplementation((widgetId, options) => {
      if (options !== undefined && typeof options.callback === 'function') {
        options.callback('turnstile-token');
      }
    });
  });

  it('should not request a token if captcha is not required for the current path', async () => {
    // Mock isCaptchaRequiredForPath to return false
    (isCaptchaRequiredForPath as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: RecoilRoot,
    });

    await act(async () => {
      await result.current.requestFreshCaptchaToken();
    });

    // Verify that no captcha provider was called
    expect(mockGrecaptchaExecute).not.toHaveBeenCalled();
    expect(mockTurnstileRender).not.toHaveBeenCalled();
    expect(mockTurnstileExecute).not.toHaveBeenCalled();
  });

  it('should not request a token if captcha provider is undefined', async () => {
    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: RecoilRoot,
    });

    await act(async () => {
      await result.current.requestFreshCaptchaToken();
    });

    // Verify that no captcha provider was called
    expect(mockGrecaptchaExecute).not.toHaveBeenCalled();
    expect(mockTurnstileRender).not.toHaveBeenCalled();
    expect(mockTurnstileExecute).not.toHaveBeenCalled();
  });

  it('should request a token from Google reCAPTCHA when provider is GOOGLE_RECAPTCHA', async () => {
    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={({ set }) => {
            set(captchaState, {
              provider: CaptchaDriverType.GOOGLE_RECAPTCHA,
              siteKey: 'google-site-key',
            });
            set(isRequestingCaptchaTokenState, false);
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    await act(async () => {
      await result.current.requestFreshCaptchaToken();
    });

    // Verify that Google reCAPTCHA was called with the correct parameters
    expect(mockGrecaptchaExecute).toHaveBeenCalledWith('google-site-key', {
      action: 'submit',
    });

    // Wait for the token to be set
    await waitFor(() => {
      expect(mockGrecaptchaExecute).toHaveBeenCalled();
    });
  });

  it('should request a token from Turnstile when provider is TURNSTILE', async () => {
    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={({ set }) => {
            set(captchaState, {
              provider: CaptchaDriverType.TURNSTILE,
              siteKey: 'turnstile-site-key',
            });
            set(isRequestingCaptchaTokenState, false);
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    await act(async () => {
      await result.current.requestFreshCaptchaToken();
    });

    // Verify that Turnstile was called with the correct parameters
    expect(mockTurnstileRender).toHaveBeenCalledWith('#captcha-widget', {
      sitekey: 'turnstile-site-key',
    });
    expect(mockTurnstileExecute).toHaveBeenCalledWith('turnstile-widget-id', {
      callback: expect.any(Function),
    });
  });
});