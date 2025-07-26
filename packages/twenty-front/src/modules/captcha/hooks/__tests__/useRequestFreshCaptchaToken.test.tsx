import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { captchaState } from '@/client-config/states/captchaState';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

jest.mock('@/captcha/utils/isCaptchaRequiredForPath');

describe('useRequestFreshCaptchaToken', () => {
  const mockGrecaptchaExecute = jest.fn();
  const mockTurnstileRender = jest.fn();
  const mockTurnstileExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    window.grecaptcha = {
      execute: mockGrecaptchaExecute,
    };

    window.turnstile = {
      render: mockTurnstileRender,
      execute: mockTurnstileExecute,
    };

    (isCaptchaRequiredForPath as jest.Mock).mockReturnValue(true);

    mockGrecaptchaExecute.mockImplementation((_siteKey, _options) => {
      return Promise.resolve('google-recaptcha-token');
    });

    mockTurnstileRender.mockImplementation((_selector, _options) => {
      return 'turnstile-widget-id';
    });

    mockTurnstileExecute.mockImplementation((widgetId, options) => {
      if (options !== undefined && typeof options.callback === 'function') {
        options.callback('turnstile-token');
      }
    });
  });

  it('should not request a token if captcha is not required for the current path', async () => {
    (isCaptchaRequiredForPath as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: RecoilRoot,
    });

    await act(async () => {
      await result.current.requestFreshCaptchaToken();
    });

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

    expect(mockGrecaptchaExecute).toHaveBeenCalledWith('google-site-key', {
      action: 'submit',
    });

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

    expect(mockTurnstileRender).toHaveBeenCalledWith('#captcha-widget', {
      sitekey: 'turnstile-site-key',
    });
    expect(mockTurnstileExecute).toHaveBeenCalledWith('turnstile-widget-id', {
      callback: expect.any(Function),
    });
  });
});
