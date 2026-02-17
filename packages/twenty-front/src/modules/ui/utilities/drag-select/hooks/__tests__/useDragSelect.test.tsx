import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode, act } from 'react';
import { RecoilRoot } from 'recoil';

import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <RecoilRoot>{children}</RecoilRoot>
  </JotaiProvider>
);

describe('useDragSelect', () => {
  it('Should set drag selection start state', () => {
    const { result } = renderHook(() => useDragSelect(), {
      wrapper: Wrapper,
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
