import { renderHook } from '@testing-library/react';

import { useIsSsoEnabled } from '@/auth/hooks/useIsSsoEnabled';

describe('useIsSsoEnabled', () => {
  // Seed window._env_ so jest.replaceProperty has a property to replace.
  // The shape doesn't matter — every test overwrites it.
  beforeAll(() => {
    if (!Object.prototype.hasOwnProperty.call(window, '_env_')) {
      Object.defineProperty(window, '_env_', {
        value: {},
        writable: true,
        configurable: true,
      });
    }
  });

  it('returns true when AUTH_TYPE is "SSO"', () => {
    jest.replaceProperty(window, '_env_', { AUTH_TYPE: 'SSO' });

    const { result } = renderHook(() => useIsSsoEnabled());

    expect(result.current).toBe(true);
  });

  it('returns false when AUTH_TYPE is some other value', () => {
    jest.replaceProperty(window, '_env_', { AUTH_TYPE: 'PASSWORD' });

    const { result } = renderHook(() => useIsSsoEnabled());

    expect(result.current).toBe(false);
  });

  it('returns false when AUTH_TYPE is missing', () => {
    jest.replaceProperty(window, '_env_', {});

    const { result } = renderHook(() => useIsSsoEnabled());

    expect(result.current).toBe(false);
  });

  it('returns false when window._env_ is undefined', () => {
    jest.replaceProperty(window, '_env_', undefined);

    const { result } = renderHook(() => useIsSsoEnabled());

    expect(result.current).toBe(false);
  });
});
