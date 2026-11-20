import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { CAPTCHA_TOKEN_MAX_AGE_IN_MS } from '@/captcha/constants/CaptchaTokenMaxAgeInMs';
import { useGetCaptchaToken } from '@/captcha/hooks/useGetCaptchaToken';
import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

jest.mock('@/captcha/utils/isCaptchaRequiredForPath');

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useGetCaptchaToken', () => {
  const mockGrecaptchaExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    let issuedTokenCount = 0;
    mockGrecaptchaExecute.mockImplementation(async () => {
      issuedTokenCount += 1;
      return `fresh-token-${issuedTokenCount}`;
    });
    window.grecaptcha = { execute: mockGrecaptchaExecute };

    jest.mocked(isCaptchaRequiredForPath).mockReturnValue(true);

    jotaiStore.set(captchaState.atom, {
      provider: CaptchaDriverType.GOOGLE_RECAPTCHA,
      siteKey: 'site-key',
    });
    jotaiStore.set(captchaTokenState.atom, undefined);
    jotaiStore.set(isCaptchaScriptLoadedState.atom, true);
    jotaiStore.set(clientConfigApiStatusState.atom, {
      ...jotaiStore.get(clientConfigApiStatusState.atom),
      isLoadedOnce: true,
    });
  });

  const getCaptchaToken = async () => {
    const { result } = renderHook(() => useGetCaptchaToken(), {
      wrapper: Wrapper,
    });

    return act(() => result.current.getCaptchaToken());
  };

  it('should return the prewarmed token and never hand it out twice', async () => {
    jotaiStore.set(captchaTokenState.atom, {
      token: 'prewarmed-token',
      issuedAt: Date.now(),
    });

    expect(await getCaptchaToken()).toBe('prewarmed-token');
    expect(await getCaptchaToken()).toBe('fresh-token-1');
    expect(await getCaptchaToken()).toBe('fresh-token-2');
  });

  it('should request a fresh token when the prewarmed one is expired', async () => {
    jotaiStore.set(captchaTokenState.atom, {
      token: 'expired-token',
      issuedAt:
        Date.now() -
        CAPTCHA_TOKEN_MAX_AGE_IN_MS[CaptchaDriverType.GOOGLE_RECAPTCHA],
    });

    expect(await getCaptchaToken()).toBe('fresh-token-1');
  });

  it('should request a token on demand when none was prewarmed', async () => {
    expect(await getCaptchaToken()).toBe('fresh-token-1');
  });

  it('should return undefined when captcha is not configured', async () => {
    jotaiStore.set(captchaState.atom, null);

    expect(await getCaptchaToken()).toBeUndefined();
    expect(mockGrecaptchaExecute).not.toHaveBeenCalled();
  });
});
