import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { usePageLayoutDragSelection } from '../usePageLayoutDragSelection';

describe('usePageLayoutDragSelection', () => {
  it('should initialize with empty selected cells', () => {
    const { result } = renderHook(() => usePageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.pageLayoutSelectedCells).toEqual(new Set());
  });

  it('should clear selected cells on drag start', () => {
    const { result } = renderHook(() => usePageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleDragSelectionChange('cell-1', true);
      result.current.handleDragSelectionChange('cell-2', true);
    });

    expect(result.current.pageLayoutSelectedCells.size).toBe(2);

    act(() => {
      result.current.handleDragSelectionStart();
    });

    expect(result.current.pageLayoutSelectedCells).toEqual(new Set());
  });

  it('should add and remove cells during drag selection', () => {
    const { result } = renderHook(() => usePageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleDragSelectionChange('cell-1', true);
    });

    expect(result.current.pageLayoutSelectedCells.has('cell-1')).toBe(true);

    act(() => {
      result.current.handleDragSelectionChange('cell-2', true);
    });

    expect(result.current.pageLayoutSelectedCells.size).toBe(2);

    act(() => {
      result.current.handleDragSelectionChange('cell-1', false);
    });

    expect(result.current.pageLayoutSelectedCells.has('cell-1')).toBe(false);
    expect(result.current.pageLayoutSelectedCells.size).toBe(1);
  });

  it('should handle drag selection end with selected cells', () => {
    const { result } = renderHook(() => usePageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleDragSelectionChange('0-0', true);
      result.current.handleDragSelectionChange('1-0', true);
      result.current.handleDragSelectionChange('0-1', true);
      result.current.handleDragSelectionChange('1-1', true);
    });

    expect(result.current.pageLayoutSelectedCells.size).toBe(4);

    act(() => {
      result.current.handleDragSelectionEnd();
    });

    expect(result.current.pageLayoutSelectedCells).toEqual(new Set());
  });

  it('should handle drag selection end with no selected cells', () => {
    const { result } = renderHook(() => usePageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleDragSelectionEnd();
    });

    expect(result.current.pageLayoutSelectedCells).toEqual(new Set());
  });

  it('should provide all required handler functions', () => {
    const { result } = renderHook(() => usePageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    expect(typeof result.current.handleDragSelectionStart).toBe('function');
    expect(typeof result.current.handleDragSelectionChange).toBe('function');
    expect(typeof result.current.handleDragSelectionEnd).toBe('function');
  });
});
