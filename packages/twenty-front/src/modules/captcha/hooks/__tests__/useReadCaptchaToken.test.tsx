import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';

describe('useReadCaptchaToken', () => {
  it('should return undefined when no token exists', async () => {
    const { result } = renderHook(() => useReadCaptchaToken(), {
      wrapper: RecoilRoot,
    });

    await act(async () => {
      const token = await result.current.readCaptchaToken();
      expect(token).toBeUndefined();
    });
  });

  it('should return the token when it exists', async () => {
    const { result } = renderHook(
      () => {
        const hook = useReadCaptchaToken();
        return hook;
      },
      {
        wrapper: ({ children }) => (
          <RecoilRoot
            initializeState={({ set }) => {
              set(captchaTokenState, 'test-token');
            }}
          >
            {children}
          </RecoilRoot>
        ),
      },
    );

    await act(async () => {
      const token = await result.current.readCaptchaToken();
      expect(token).toBe('test-token');
    });
  });
});
