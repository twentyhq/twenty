import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { CAPTCHA_TOKEN_REQUEST_TIMEOUT_IN_MS } from '@/captcha/constants/CaptchaTokenRequestTimeoutInMs';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

jest.mock('@/captcha/utils/isCaptchaRequiredForPath');
jest.mock('~/utils/logError');

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const setCaptchaProvider = (provider: CaptchaDriverType) =>
  jotaiStore.set(captchaState.atom, {
    provider,
    siteKey: 'site-key',
  });

describe('useRequestFreshCaptchaToken', () => {
  const mockGrecaptchaExecute = jest.fn();
  const mockTurnstileRender = jest.fn();
  const mockTurnstileRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    window.grecaptcha = { execute: mockGrecaptchaExecute };
    window.turnstile = {
      render: mockTurnstileRender,
      remove: mockTurnstileRemove,
    };

    jest.mocked(isCaptchaRequiredForPath).mockReturnValue(true);
    mockGrecaptchaExecute.mockResolvedValue('google-recaptcha-token');
    mockTurnstileRender.mockImplementation((_container, options) => {
      setTimeout(() => options.callback('turnstile-token'));

      return 'turnstile-widget-id';
    });

    document.body.innerHTML = '<div id="captcha-widget"></div>';

    jotaiStore.set(captchaState.atom, null);
    jotaiStore.set(captchaTokenState.atom, undefined);
    jotaiStore.set(isCaptchaScriptLoadedState.atom, true);
    jotaiStore.set(clientConfigApiStatusState.atom, {
      ...jotaiStore.get(clientConfigApiStatusState.atom),
      isLoadedOnce: true,
    });
  });

  const requestFreshCaptchaToken = async () => {
    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: Wrapper,
    });

    return act(() => result.current.requestFreshCaptchaToken());
  };

  it('should not request a token if captcha is not required for the current path', async () => {
    jest.mocked(isCaptchaRequiredForPath).mockReturnValue(false);
    setCaptchaProvider(CaptchaDriverType.GOOGLE_RECAPTCHA);

    expect(await requestFreshCaptchaToken()).toBeUndefined();
    expect(mockGrecaptchaExecute).not.toHaveBeenCalled();
  });

  it('should not request a token if captcha is not configured', async () => {
    expect(await requestFreshCaptchaToken()).toBeUndefined();
    expect(mockGrecaptchaExecute).not.toHaveBeenCalled();
    expect(mockTurnstileRender).not.toHaveBeenCalled();
  });

  it('should store a timestamped Google reCAPTCHA token', async () => {
    setCaptchaProvider(CaptchaDriverType.GOOGLE_RECAPTCHA);

    const captchaToken = await requestFreshCaptchaToken();

    expect(mockGrecaptchaExecute).toHaveBeenCalledWith('site-key', {
      action: 'submit',
    });
    expect(captchaToken).toEqual({
      token: 'google-recaptcha-token',
      issuedAt: expect.any(Number),
    });
    expect(jotaiStore.get(captchaTokenState.atom)).toEqual(captchaToken);
  });

  it('should store a Turnstile token and remove the widget it came from', async () => {
    setCaptchaProvider(CaptchaDriverType.TURNSTILE);

    const captchaToken = await requestFreshCaptchaToken();

    expect(mockTurnstileRender).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({ sitekey: 'site-key' }),
    );
    expect(captchaToken?.token).toBe('turnstile-token');
    expect(mockTurnstileRemove).toHaveBeenCalledWith('turnstile-widget-id');
  });

  it('should resolve to undefined when the Turnstile widget container is missing', async () => {
    setCaptchaProvider(CaptchaDriverType.TURNSTILE);
    document.body.innerHTML = '';

    expect(await requestFreshCaptchaToken()).toBeUndefined();
    expect(mockTurnstileRender).not.toHaveBeenCalled();
  });

  it('should wait for the captcha script before requesting a token', async () => {
    setCaptchaProvider(CaptchaDriverType.GOOGLE_RECAPTCHA);
    jotaiStore.set(isCaptchaScriptLoadedState.atom, false);

    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: Wrapper,
    });

    const pendingCaptchaToken = result.current.requestFreshCaptchaToken();

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGrecaptchaExecute).not.toHaveBeenCalled();

    await act(async () => {
      jotaiStore.set(isCaptchaScriptLoadedState.atom, true);
      await pendingCaptchaToken;
    });

    expect(mockGrecaptchaExecute).toHaveBeenCalledTimes(1);
  });

  it('should resolve to undefined when the provider fails', async () => {
    setCaptchaProvider(CaptchaDriverType.TURNSTILE);
    mockTurnstileRender.mockImplementation((_container, options) => {
      setTimeout(() => options['error-callback']('110200'));

      return 'turnstile-widget-id';
    });

    expect(await requestFreshCaptchaToken()).toBeUndefined();
    expect(jotaiStore.get(captchaTokenState.atom)).toBeUndefined();
  });

  it('should resolve to undefined when the script never loads', async () => {
    jest.useFakeTimers();
    setCaptchaProvider(CaptchaDriverType.GOOGLE_RECAPTCHA);
    jotaiStore.set(isCaptchaScriptLoadedState.atom, false);

    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: Wrapper,
    });

    const pendingCaptchaToken = result.current.requestFreshCaptchaToken();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(CAPTCHA_TOKEN_REQUEST_TIMEOUT_IN_MS);
    });

    expect(await pendingCaptchaToken).toBeUndefined();

    await act(async () => {
      jotaiStore.set(isCaptchaScriptLoadedState.atom, true);
      await jest.advanceTimersByTimeAsync(0);
    });

    expect(mockGrecaptchaExecute).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should remove a Turnstile widget that stalls past the timeout', async () => {
    jest.useFakeTimers();
    setCaptchaProvider(CaptchaDriverType.TURNSTILE);
    mockTurnstileRender.mockReturnValue('turnstile-widget-id');

    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: Wrapper,
    });

    const pendingCaptchaToken = result.current.requestFreshCaptchaToken();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(CAPTCHA_TOKEN_REQUEST_TIMEOUT_IN_MS);
    });

    expect(await pendingCaptchaToken).toBeUndefined();
    expect(mockTurnstileRemove).toHaveBeenCalledWith('turnstile-widget-id');
    expect(document.querySelector('#captcha-widget')?.children).toHaveLength(0);
    jest.useRealTimers();
  });
});
