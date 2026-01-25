import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { vi } from 'vitest';

import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
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
