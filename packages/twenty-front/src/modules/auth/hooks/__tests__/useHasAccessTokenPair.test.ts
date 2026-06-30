import { act, renderHook } from '@testing-library/react';

import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const renderHooks = () => {
  const { result } = renderHook(() => {
    const hasAccessTokenPair = useHasAccessTokenPair();
    const setTokenPair = useSetAtomState(tokenPairState);

    return {
      hasAccessTokenPair,
      setTokenPair,
    };
  });
  return { result };
};

describe('useHasAccessTokenPair', () => {
  it('should return correct value', async () => {
    const { result } = renderHooks();

    expect(result.current.hasAccessTokenPair).toBe(false);

    await act(async () => {
      result.current.setTokenPair({
        accessOrWorkspaceAgnosticToken: {
          expiresAt: '',
          token: 'testToken',
        },
        refreshToken: {
          expiresAt: '',
          token: 'testToken',
        },
      });
    });

    expect(result.current.hasAccessTokenPair).toBe(true);
  });
});
