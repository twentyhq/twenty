import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('useSystemColorScheme', () => {
  it('should update color scheme', async () => {
    const { result } = renderHook(() => useSystemColorScheme(), {
      wrapper: RecoilRoot,
    });

    expect(result.current).toBe('Light');
  });
});
