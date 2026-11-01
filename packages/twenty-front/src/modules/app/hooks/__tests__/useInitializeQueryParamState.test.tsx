import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import Cookies from 'js-cookie';
import { type ReactNode } from 'react';

import { useInitializeQueryParamState } from '@/app/hooks/useInitializeQueryParamState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const initializeQueryParamStateAt = (url: string) => {
  window.history.pushState({}, '', url);

  const { result } = renderHook(() => useInitializeQueryParamState(), {
    wrapper: Wrapper,
  });

  act(() => {
    result.current.initializeQueryParamState();
  });
};

describe('useInitializeQueryParamState', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  afterEach(() => {
    Cookies.remove('partner');
    window.history.pushState({}, '', '/');
  });

  it('should store the normalized partner in the cookie', () => {
    initializeQueryParamStateAt('/welcome?partner=%20Acme%20');

    expect(Cookies.get('partner')).toBe(JSON.stringify({ partner: 'acme' }));
  });

  it('should not re-render the caller when it stores the partner', () => {
    window.history.pushState({}, '', '/welcome?partner=acme');

    let renderCount = 0;

    const { result } = renderHook(
      () => {
        renderCount++;

        return useInitializeQueryParamState();
      },
      { wrapper: Wrapper },
    );

    const renderCountBeforeInitialization = renderCount;

    act(() => {
      result.current.initializeQueryParamState();
    });

    expect(renderCount).toBe(renderCountBeforeInitialization);
  });

  it('should keep the stored partner when the new one is invalid', () => {
    Cookies.set('partner', JSON.stringify({ partner: 'acme' }));

    initializeQueryParamStateAt('/welcome?partner=%3Cx%3E');

    expect(Cookies.get('partner')).toBe(JSON.stringify({ partner: 'acme' }));
  });
});
