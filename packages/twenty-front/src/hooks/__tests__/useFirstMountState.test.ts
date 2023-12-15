import { renderHook } from '@testing-library/react';

import { useFirstMountState } from '~/hooks/useFirstMountState';

describe('useFirstMountState', () => {
  it('should return true on first mount', () => {
    const { result } = renderHook(() => {
      return useFirstMountState();
    });

    expect(result.current).toBe(true);
  });

  it('should return false on second mount', () => {
    const { result, rerender } = renderHook(() => {
      return useFirstMountState();
    });

    rerender();

    expect(result.current).toBe(false);
  });
});
