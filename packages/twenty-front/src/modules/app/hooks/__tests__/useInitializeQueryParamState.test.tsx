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

  it('should store the normalized partner from the via param in the cookie', () => {
    initializeQueryParamStateAt('/welcome?via=%20NorthWind%20');

    expect(Cookies.get('partner')).toBe(
      JSON.stringify({ partner: 'northwind' }),
    );
  });

  it('should ignore the former partner param', () => {
    initializeQueryParamStateAt('/welcome?partner=acme');

    expect(Cookies.get('partner')).toBeUndefined();
  });

  it('should not re-render the caller when it stores the partner', () => {
    window.history.pushState({}, '', '/welcome?via=acme');

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

    initializeQueryParamStateAt('/welcome?via=%3Cx%3E');

    expect(Cookies.get('partner')).toBe(JSON.stringify({ partner: 'acme' }));
  });
});
