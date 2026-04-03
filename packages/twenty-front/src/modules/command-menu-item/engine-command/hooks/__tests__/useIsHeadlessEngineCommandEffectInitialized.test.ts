import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { renderHook, act } from '@testing-library/react';

describe('useIsHeadlessEngineCommandEffectInitialized', () => {
  it('should return isInitializedRef as false initially', () => {
    const { result } = renderHook(() =>
      useIsHeadlessEngineCommandEffectInitialized(),
    );

    expect(result.current.isInitializedRef.current).toBe(false);
  });

  it('should update isInitializedRef to true after calling setIsInitialized(true)', () => {
    const { result } = renderHook(() =>
      useIsHeadlessEngineCommandEffectInitialized(),
    );

    act(() => {
      result.current.setIsInitialized(true);
    });

    expect(result.current.isInitializedRef.current).toBe(true);
  });

  it('should toggle back to false after calling setIsInitialized(false)', () => {
    const { result } = renderHook(() =>
      useIsHeadlessEngineCommandEffectInitialized(),
    );

    act(() => {
      result.current.setIsInitialized(true);
    });

    expect(result.current.isInitializedRef.current).toBe(true);

    act(() => {
      result.current.setIsInitialized(false);
    });

    expect(result.current.isInitializedRef.current).toBe(false);
  });
});
