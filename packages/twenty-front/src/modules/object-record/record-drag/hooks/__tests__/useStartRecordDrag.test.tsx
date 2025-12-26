import { type DragStart } from '@hello-pangea/dnd';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/states/isMultiDragActiveComponentState';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/states/primaryDraggedRecordIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const createDragStart = (draggableId: string, index: number): DragStart => ({
  draggableId,
  type: 'record',
  source: {
    droppableId: 'test-droppable',
    index,
  },
  mode: 'FLUID',
});

describe('useStartRecordDrag', () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({});

  it('should set single drag state when dragged record is not in selection', () => {
    const { result } = renderHook(
      () => {
        const isMultiDragActive = useRecoilComponentValue(
          isMultiDragActiveComponentState,
        );
        const draggedRecordIds = useRecoilComponentValue(
          draggedRecordIdsComponentState,
        );
        const primaryDraggedRecordId = useRecoilComponentValue(
          primaryDraggedRecordIdComponentState,
        );
        const originalSelection = useRecoilComponentValue(
          originalDragSelectionComponentState,
        );

        const { startRecordDrag } = useStartRecordDrag();

        return {
          startRecordDrag,
          isMultiDragActive,
          draggedRecordIds,
          primaryDraggedRecordId,
          originalSelection,
        };
      },
      { wrapper: Wrapper },
    );

    const dragStart = createDragStart('record-1', 0);
    const selectedRecordIds = ['record-2', 'record-3'];

    act(() => {
      result.current.startRecordDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.isMultiDragActive).toBe(true);
    expect(result.current.draggedRecordIds).toEqual(['record-1']);
    expect(result.current.primaryDraggedRecordId).toBe('record-1');
    expect(result.current.originalSelection).toEqual(['record-1']);
  });

  it('should set single drag state when only one record is selected', () => {
    const { result } = renderHook(
      () => {
        const isMultiDragActive = useRecoilComponentValue(
          isMultiDragActiveComponentState,
        );
        const draggedRecordIds = useRecoilComponentValue(
          draggedRecordIdsComponentState,
        );
        const primaryDraggedRecordId = useRecoilComponentValue(
          primaryDraggedRecordIdComponentState,
        );
        const originalSelection = useRecoilComponentValue(
          originalDragSelectionComponentState,
        );

        const { startRecordDrag } = useStartRecordDrag();

        return {
          startRecordDrag,
          isMultiDragActive,
          draggedRecordIds,
          primaryDraggedRecordId,
          originalSelection,
        };
      },
      { wrapper: Wrapper },
    );

    const dragStart = createDragStart('record-1', 0);
    const selectedRecordIds = ['record-1'];

    act(() => {
      result.current.startRecordDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.isMultiDragActive).toBe(true);
    expect(result.current.draggedRecordIds).toEqual(['record-1']);
    expect(result.current.primaryDraggedRecordId).toBe('record-1');
    expect(result.current.originalSelection).toEqual(['record-1']);
  });

  it('should set multi drag state when multiple records are selected', () => {
    const { result } = renderHook(
      () => {
        const isMultiDragActive = useRecoilComponentValue(
          isMultiDragActiveComponentState,
        );
        const draggedRecordIds = useRecoilComponentValue(
          draggedRecordIdsComponentState,
        );
        const primaryDraggedRecordId = useRecoilComponentValue(
          primaryDraggedRecordIdComponentState,
        );
        const originalSelection = useRecoilComponentValue(
          originalDragSelectionComponentState,
        );

        const { startRecordDrag } = useStartRecordDrag();

        return {
          startRecordDrag,
          isMultiDragActive,
          draggedRecordIds,
          primaryDraggedRecordId,
          originalSelection,
        };
      },
      { wrapper: Wrapper },
    );

    const dragStart = createDragStart('record-2', 1);
    const selectedRecordIds = ['record-1', 'record-2', 'record-3'];

    act(() => {
      result.current.startRecordDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.isMultiDragActive).toBe(true);
    expect(result.current.draggedRecordIds).toEqual([
      'record-1',
      'record-2',
      'record-3',
    ]);
    expect(result.current.primaryDraggedRecordId).toBe('record-2');
    expect(result.current.originalSelection).toEqual([
      'record-1',
      'record-2',
      'record-3',
    ]);
  });

  it('should handle empty selection', () => {
    const { result } = renderHook(
      () => {
        const isMultiDragActive = useRecoilComponentValue(
          isMultiDragActiveComponentState,
        );
        const draggedRecordIds = useRecoilComponentValue(
          draggedRecordIdsComponentState,
        );
        const primaryDraggedRecordId = useRecoilComponentValue(
          primaryDraggedRecordIdComponentState,
        );
        const originalSelection = useRecoilComponentValue(
          originalDragSelectionComponentState,
        );

        const { startRecordDrag } = useStartRecordDrag();

        return {
          startRecordDrag,
          isMultiDragActive,
          draggedRecordIds,
          primaryDraggedRecordId,
          originalSelection,
        };
      },
      { wrapper: Wrapper },
    );

    const dragStart = createDragStart('record-1', 0);
    const selectedRecordIds: string[] = [];

    act(() => {
      result.current.startRecordDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.isMultiDragActive).toBe(true);
    expect(result.current.draggedRecordIds).toEqual(['record-1']);
    expect(result.current.primaryDraggedRecordId).toBe('record-1');
    expect(result.current.originalSelection).toEqual(['record-1']);
  });

  it('should set single drag state when dragged record is not in selection', () => {
    const { result } = renderHook(
      () => {
        const isMultiDragActive = useRecoilComponentValue(
          isMultiDragActiveComponentState,
        );
        const draggedRecordIds = useRecoilComponentValue(
          draggedRecordIdsComponentState,
        );
        const primaryDraggedRecordId = useRecoilComponentValue(
          primaryDraggedRecordIdComponentState,
        );
        const originalSelection = useRecoilComponentValue(
          originalDragSelectionComponentState,
        );

        const { startRecordDrag } = useStartRecordDrag();

        return {
          startRecordDrag,
          isMultiDragActive,
          draggedRecordIds,
          primaryDraggedRecordId,
          originalSelection,
        };
      },
      { wrapper: Wrapper },
    );

    const dragStart = createDragStart('record-1', 0);
    const selectedRecordIds = ['record-2', 'record-3'];

    act(() => {
      result.current.startRecordDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.isMultiDragActive).toBe(true);
    expect(result.current.draggedRecordIds).toEqual(['record-1']);
    expect(result.current.primaryDraggedRecordId).toBe('record-1');
    expect(result.current.originalSelection).toEqual(['record-1']);
  });

  it('should set multi drag state when multiple records are selected', () => {
    const { result } = renderHook(
      () => {
        const isMultiDragActive = useRecoilComponentValue(
          isMultiDragActiveComponentState,
        );
        const draggedRecordIds = useRecoilComponentValue(
          draggedRecordIdsComponentState,
        );
        const primaryDraggedRecordId = useRecoilComponentValue(
          primaryDraggedRecordIdComponentState,
        );
        const originalSelection = useRecoilComponentValue(
          originalDragSelectionComponentState,
        );

        const { startRecordDrag } = useStartRecordDrag();

        return {
          startRecordDrag,
          isMultiDragActive,
          draggedRecordIds,
          primaryDraggedRecordId,
          originalSelection,
        };
      },
      { wrapper: Wrapper },
    );

    const dragStart = createDragStart('record-2', 1);
    const selectedRecordIds = ['record-1', 'record-2', 'record-3'];

    act(() => {
      result.current.startRecordDrag(dragStart, selectedRecordIds);
    });

    expect(result.current.isMultiDragActive).toBe(true);
    expect(result.current.draggedRecordIds).toEqual([
      'record-1',
      'record-2',
      'record-3',
    ]);
    expect(result.current.primaryDraggedRecordId).toBe('record-2');
    expect(result.current.originalSelection).toEqual([
      'record-1',
      'record-2',
      'record-3',
    ]);
  });
});
