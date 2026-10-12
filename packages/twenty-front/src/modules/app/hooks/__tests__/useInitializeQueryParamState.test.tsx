import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import Cookies from 'js-cookie';
import { type ReactNode } from 'react';

import { useInitializeQueryParamState } from '@/app/hooks/useInitializeQueryParamState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
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
    jotaiStore.set(domainConfigurationState.atom, {
      frontDomain: 'localhost',
      defaultSubdomain: 'app',
      publicFunctionDomain: undefined,
      serverUrl: 'http://localhost:3000',
    });
  });

  afterEach(() => {
    Cookies.remove('partner', { domain: '.localhost' });
    window.history.pushState({}, '', '/');
  });

  it('should store a valid partner in the parent domain cookie', () => {
    initializeQueryParamStateAt('/welcome?partner=%20Acme%20');

    expect(Cookies.get('partner')).toBe(JSON.stringify({ partner: 'acme' }));
  });

  it('should overwrite a previously stored partner', () => {
    Cookies.set('partner', JSON.stringify({ partner: 'alpha' }), {
      domain: '.localhost',
    });

    initializeQueryParamStateAt('/welcome?partner=beta');

    expect(Cookies.get('partner')).toBe(JSON.stringify({ partner: 'beta' }));
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

  it('should ignore an invalid partner', () => {
    initializeQueryParamStateAt('/welcome?partner=%3Cx%3E');

    expect(Cookies.get('partner')).toBeUndefined();
  });
});
