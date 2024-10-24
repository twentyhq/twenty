import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { tokenPairState } from '@/auth/states/tokenPairState';

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const isLogged = useIsLogged();
      const setTokenPair = useSetRecoilState(tokenPairState);

      return {
        isLogged,
        setTokenPair,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );
  return { result };
};

describe('useIsLogged', () => {
  it('should return correct value', async () => {
    const { result } = renderHooks();

    expect(result.current.isLogged).toBe(false);

    await act(async () => {
      result.current.setTokenPair({
        accessToken: {
          expiresAt: '',
          token: 'testToken',
        },
        refreshToken: {
          expiresAt: '',
          token: 'testToken',
        },
      });
    });

    expect(result.current.isLogged).toBe(true);
  });
});
