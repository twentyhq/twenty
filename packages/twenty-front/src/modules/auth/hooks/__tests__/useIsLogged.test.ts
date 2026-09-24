import { act, renderHook } from '@testing-library/react';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const renderHooks = () => {
  const { result } = renderHook(() => ({
    isLogged: useIsLogged(),
    setIsCookieAuthActive: useSetAtomState(isCookieAuthActiveState),
  }));

  return { result };
};

describe('useIsLogged', () => {
  it('should follow the cookie session', async () => {
    const { result } = renderHooks();

    expect(result.current.isLogged).toBe(false);

    await act(async () => {
      result.current.setIsCookieAuthActive(true);
    });

    expect(result.current.isLogged).toBe(true);

    await act(async () => {
      result.current.setIsCookieAuthActive(false);
    });

    expect(result.current.isLogged).toBe(false);
  });
});
