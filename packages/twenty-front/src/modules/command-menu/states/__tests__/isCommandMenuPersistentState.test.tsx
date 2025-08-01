import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import { isCommandMenuPersistentState } from '@/command-menu/states/isCommandMenuPersistentState';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('isCommandMenuPersistentState', () => {
  it('should have default value of false', () => {
    const { result } = renderHook(
      () => useRecoilState(isCommandMenuPersistentState),
      { wrapper: Wrapper },
    );

    expect(result.current[0]).toBe(false);
  });

  it('should allow setting persistent state to true', () => {
    const { result } = renderHook(
      () => useRecoilState(isCommandMenuPersistentState),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('should allow toggling persistent state', () => {
    const { result } = renderHook(
      () => useRecoilState(isCommandMenuPersistentState),
      { wrapper: Wrapper },
    );

    // Initially false
    expect(result.current[0]).toBe(false);

    // Toggle to true
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    // Toggle back to false
    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(false);
  });

  it('should maintain state across re-renders', () => {
    const { result, rerender } = renderHook(
      () => useRecoilState(isCommandMenuPersistentState),
      { wrapper: Wrapper },
    );

    // Set to true
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    // Re-render and check state is maintained
    rerender();
    expect(result.current[0]).toBe(true);
  });
});
