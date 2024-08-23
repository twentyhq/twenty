import { renderHook } from '@testing-library/react';

import { useScrollWrapperScopedRef } from '@/ui/utilities/scroll/hooks/useScrollWrapperScopedRef';

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');
  return {
    ...originalModule,
    useContext: () => ({ current: {} }),
  };
});

describe('useScrollWrapperScopedRef', () => {
  it('should return the scrollWrapperRef if available', () => {
    const { result } = renderHook(() => useScrollWrapperScopedRef('test'));

    expect(result.current).toBeDefined();
  });
});
