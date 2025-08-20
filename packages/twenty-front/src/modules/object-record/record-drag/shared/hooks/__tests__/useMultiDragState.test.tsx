import { type DragStart } from '@hello-pangea/dnd';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useMultiDragState } from '@/object-record/record-drag/shared/hooks/useMultiDragState';

const createDragStart = (draggableId: string, index: number): DragStart => ({
  draggableId,
  type: 'record',
  source: {
    droppableId: 'test-droppable',
    index,
  },
  mode: 'FLUID',
});

describe('useMultiDragState', () => {
  it('should have initial state with no drag', () => {
    const { result } = renderHook(() => useMultiDragState());

    expect(result.current.multiDragState.isDragging).toBe(false);
    expect(result.current.multiDragState.draggedRecordIds).toEqual([]);
    expect(result.current.multiDragState.primaryDraggedRecordId).toBeNull();
    expect(result.current.multiDragState.originalSelection).toEqual([]);
  });

  it('should handle single drag when record is not in selection', () => {
    const { result } = renderHook(() => useMultiDragState());

    const dragStart = createDragStart('record-1', 0);
    const selectedRecordIds = ['record-2', 'record-3'];

    act(() => {
      result.current.startDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.multiDragState.isDragging).toBe(true);
    expect(result.current.multiDragState.draggedRecordIds).toEqual([
      'record-1',
    ]);
    expect(result.current.multiDragState.primaryDraggedRecordId).toBe(
      'record-1',
    );
    expect(result.current.multiDragState.originalSelection).toEqual([
      'record-1',
    ]);
  });

  it('should handle single drag when only one record is selected', () => {
    const { result } = renderHook(() => useMultiDragState());

    const dragStart = createDragStart('record-1', 0);
    const selectedRecordIds = ['record-1'];

    act(() => {
      result.current.startDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.multiDragState.isDragging).toBe(true);
    expect(result.current.multiDragState.draggedRecordIds).toEqual([
      'record-1',
    ]);
    expect(result.current.multiDragState.primaryDraggedRecordId).toBe(
      'record-1',
    );
    expect(result.current.multiDragState.originalSelection).toEqual([
      'record-1',
    ]);
  });

  it('should handle multi drag when multiple records are selected', () => {
    const { result } = renderHook(() => useMultiDragState());

    const dragStart = createDragStart('record-2', 1);
    const selectedRecordIds = ['record-1', 'record-2', 'record-3'];

    act(() => {
      result.current.startDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.multiDragState.isDragging).toBe(true);
    expect(result.current.multiDragState.draggedRecordIds).toEqual([
      'record-1',
      'record-2',
      'record-3',
    ]);
    expect(result.current.multiDragState.primaryDraggedRecordId).toBe(
      'record-2',
    );
    expect(result.current.multiDragState.originalSelection).toEqual([
      'record-1',
      'record-2',
      'record-3',
    ]);
  });

  it('should clear state when endDrag is called', () => {
    const { result } = renderHook(() => useMultiDragState());

    const dragStart = createDragStart('record-1', 0);
    const selectedRecordIds = ['record-1', 'record-2'];

    act(() => {
      result.current.startDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.multiDragState.isDragging).toBe(true);

    act(() => {
      result.current.endDrag();
    });

    expect(result.current.multiDragState.isDragging).toBe(false);
    expect(result.current.multiDragState.draggedRecordIds).toEqual([]);
    expect(result.current.multiDragState.primaryDraggedRecordId).toBeNull();
    expect(result.current.multiDragState.originalSelection).toEqual([]);
  });

  it('should handle empty selection', () => {
    const { result } = renderHook(() => useMultiDragState());

    const dragStart = createDragStart('record-1', 0);
    const selectedRecordIds: string[] = [];

    act(() => {
      result.current.startDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.multiDragState.isDragging).toBe(true);
    expect(result.current.multiDragState.draggedRecordIds).toEqual([
      'record-1',
    ]);
    expect(result.current.multiDragState.primaryDraggedRecordId).toBe(
      'record-1',
    );
    expect(result.current.multiDragState.originalSelection).toEqual([
      'record-1',
    ]);
  });
});
