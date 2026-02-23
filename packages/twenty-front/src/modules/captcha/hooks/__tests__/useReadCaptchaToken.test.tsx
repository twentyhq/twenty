import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { RecoilRoot } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <RecoilRoot>{children}</RecoilRoot>
  </JotaiProvider>
);

describe('useReadCaptchaToken', () => {
  beforeEach(() => {
    jotaiStore.set(captchaTokenState.atom, undefined);
  });

  it('should return undefined when no token exists', async () => {
    const { result } = renderHook(() => useReadCaptchaToken(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const token = await result.current.readCaptchaToken();
      expect(token).toBeUndefined();
    });
  });

  it('should return the token when it exists', async () => {
    jotaiStore.set(captchaTokenState.atom, 'test-token');

    const { result } = renderHook(() => useReadCaptchaToken(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const token = await result.current.readCaptchaToken();
      expect(token).toBe('test-token');
    });
  });
});
