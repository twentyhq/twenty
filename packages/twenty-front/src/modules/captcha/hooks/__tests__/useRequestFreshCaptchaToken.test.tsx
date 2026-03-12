import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { captchaState } from '@/client-config/states/captchaState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Captcha, CaptchaDriverType } from '~/generated-metadata/graphql';

jest.mock('@/captcha/utils/isCaptchaRequiredForPath');

const createWrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

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
      wrapper: createWrapper,
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
      wrapper: createWrapper,
    });

    await act(async () => {
      await result.current.requestFreshCaptchaToken();
    });

    expect(mockGrecaptchaExecute).not.toHaveBeenCalled();
    expect(mockTurnstileRender).not.toHaveBeenCalled();
    expect(mockTurnstileExecute).not.toHaveBeenCalled();
  });

  it('should request a token from Google reCAPTCHA when provider is GOOGLE_RECAPTCHA', async () => {
    jotaiStore.set(isRequestingCaptchaTokenState.atom, false);
    jotaiStore.set(captchaState.atom, {
      provider: CaptchaDriverType.GOOGLE_RECAPTCHA,
      siteKey: 'google-site-key',
    } as Captcha);

    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: createWrapper,
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
    jotaiStore.set(isRequestingCaptchaTokenState.atom, false);
    jotaiStore.set(captchaState.atom, {
      provider: CaptchaDriverType.TURNSTILE,
      siteKey: 'turnstile-site-key',
    } as Captcha);

    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: createWrapper,
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
