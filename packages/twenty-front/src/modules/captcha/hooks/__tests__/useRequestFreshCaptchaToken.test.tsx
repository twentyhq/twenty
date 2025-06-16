import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import * as ReactRouterDom from 'react-router-dom';

import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

describe('useRequestFreshCaptchaToken', () => {
  beforeEach(() => {
    // Mock useLocation to return a path that requires captcha
    (ReactRouterDom.useLocation as jest.Mock).mockReturnValue({
      pathname: '/sign-in',
    });

    // Mock window.grecaptcha
    window.grecaptcha = {
      execute: jest.fn().mockImplementation(() => {
        return Promise.resolve('google-recaptcha-token');
      }),
    };

    // Mock window.turnstile
    window.turnstile = {
      render: jest.fn().mockReturnValue('turnstile-widget-id'),
      execute: jest.fn().mockImplementation((widgetId, options) => {
        return options?.callback('turnstile-token');
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete window.grecaptcha;
    delete window.turnstile;
  });

  it('should not request a token if captcha is not required for the path', async () => {
    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: RecoilRoot,
    });

    await act(async () => {
      await result.current.requestFreshCaptchaToken();
    });

    expect(window.grecaptcha.execute).not.toHaveBeenCalled();
    expect(window.turnstile.execute).not.toHaveBeenCalled();
  });

  it('should not request a token if captcha provider is not defined', async () => {
    const { result } = renderHook(() => useRequestFreshCaptchaToken(), {
      wrapper: RecoilRoot,
    });

    await act(async () => {
      await result.current.requestFreshCaptchaToken();
    });

    expect(window.grecaptcha.execute).not.toHaveBeenCalled();
    expect(window.turnstile.execute).not.toHaveBeenCalled();
  });
});
