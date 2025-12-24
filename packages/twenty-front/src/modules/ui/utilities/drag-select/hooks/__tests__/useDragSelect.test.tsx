import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';

describe('useDragSelect', () => {
  it('Should set drag selection start state', () => {
    const { result } = renderHook(() => useDragSelect(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.isDragSelectionStartEnabled()).toBe(true);

    act(() => {
      result.current.setDragSelectionStartEnabled(false);
    });

    expect(result.current.isDragSelectionStartEnabled()).toBe(false);

    act(() => {
      result.current.setDragSelectionStartEnabled(true);
    });

    expect(result.current.isDragSelectionStartEnabled()).toBe(true);
  });
});
