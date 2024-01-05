import { renderHook } from '@testing-library/react';

import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

describe('useMoveViewColumns', () => {
  it('should move columns to the left correctly', () => {
    const { result } = renderHook(() => useMoveViewColumns());

    const initialArray = [{ position: 0 }, { position: 1 }, { position: 2 }];

    const movedArray = result.current.handleColumnMove('left', 1, initialArray);

    expect(movedArray).toEqual([
      { position: 0, index: 0 },
      { position: 1, index: 1 },
      { position: 2 },
    ]);
  });

  it('should move columns to the right correctly', () => {
    const { result } = renderHook(() => useMoveViewColumns());

    const initialArray = [{ position: 0 }, { position: 1 }, { position: 2 }];

    const movedArray = result.current.handleColumnMove(
      'right',
      1,
      initialArray,
    );

    expect(movedArray).toEqual([
      { position: 0 },
      { position: 1, index: 1 },
      { position: 2, index: 2 },
    ]);
  });

  it('should handle invalid moves without modifying the array', () => {
    const { result } = renderHook(() => useMoveViewColumns());

    const initialArray = [{ position: 0 }, { position: 1 }, { position: 2 }];

    const movedArray = result.current.handleColumnMove('left', 0, initialArray);

    expect(movedArray).toEqual(initialArray);
  });
});
