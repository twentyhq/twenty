import { type DragStart } from '@hello-pangea/dnd';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-drag/board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/board/states/primaryDraggedRecordIdComponentState';
import { useStartRecordDrag } from '@/object-record/record-drag/shared/hooks/useStartRecordDrag';
import { draggedRecordIdsTableComponentState } from '@/object-record/record-drag/table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-drag/table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-drag/table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-drag/table/states/primaryDraggedRecordIdTableComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

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
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot>{children}</RecoilRoot>
  );

  describe('Board context', () => {
    it('should set single drag state when dragged record is not in selection', () => {
      const instanceId = 'test-instance';

      const { result } = renderHook(
        () => {
          const isMultiDragActive = useRecoilComponentValue(
            isMultiDragActiveComponentState,
            instanceId,
          );
          const draggedRecordIds = useRecoilComponentValue(
            draggedRecordIdsComponentState,
            instanceId,
          );
          const primaryDraggedRecordId = useRecoilComponentValue(
            primaryDraggedRecordIdComponentState,
            instanceId,
          );
          const originalSelection = useRecoilComponentValue(
            originalSelectionComponentState,
            instanceId,
          );

          const { startDrag } = useStartRecordDrag('board', instanceId);

          return {
            startDrag,
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
        result.current.startDrag(dragStart, selectedRecordIds);
      });

      expect(result.current.isMultiDragActive).toBe(true);
      expect(result.current.draggedRecordIds).toEqual(['record-1']);
      expect(result.current.primaryDraggedRecordId).toBe('record-1');
      expect(result.current.originalSelection).toEqual(['record-1']);
    });

    it('should set single drag state when only one record is selected', () => {
      const instanceId = 'test-instance';

      const { result } = renderHook(
        () => {
          const isMultiDragActive = useRecoilComponentValue(
            isMultiDragActiveComponentState,
            instanceId,
          );
          const draggedRecordIds = useRecoilComponentValue(
            draggedRecordIdsComponentState,
            instanceId,
          );
          const primaryDraggedRecordId = useRecoilComponentValue(
            primaryDraggedRecordIdComponentState,
            instanceId,
          );
          const originalSelection = useRecoilComponentValue(
            originalSelectionComponentState,
            instanceId,
          );

          const { startDrag } = useStartRecordDrag('board', instanceId);

          return {
            startDrag,
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
        result.current.startDrag(dragStart, selectedRecordIds);
      });

      expect(result.current.isMultiDragActive).toBe(true);
      expect(result.current.draggedRecordIds).toEqual(['record-1']);
      expect(result.current.primaryDraggedRecordId).toBe('record-1');
      expect(result.current.originalSelection).toEqual(['record-1']);
    });

    it('should set multi drag state when multiple records are selected', () => {
      const instanceId = 'test-instance';

      const { result } = renderHook(
        () => {
          const isMultiDragActive = useRecoilComponentValue(
            isMultiDragActiveComponentState,
            instanceId,
          );
          const draggedRecordIds = useRecoilComponentValue(
            draggedRecordIdsComponentState,
            instanceId,
          );
          const primaryDraggedRecordId = useRecoilComponentValue(
            primaryDraggedRecordIdComponentState,
            instanceId,
          );
          const originalSelection = useRecoilComponentValue(
            originalSelectionComponentState,
            instanceId,
          );

          const { startDrag } = useStartRecordDrag('board', instanceId);

          return {
            startDrag,
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
        result.current.startDrag(dragStart, selectedRecordIds);
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
      const instanceId = 'test-instance';

      const { result } = renderHook(
        () => {
          const isMultiDragActive = useRecoilComponentValue(
            isMultiDragActiveComponentState,
            instanceId,
          );
          const draggedRecordIds = useRecoilComponentValue(
            draggedRecordIdsComponentState,
            instanceId,
          );
          const primaryDraggedRecordId = useRecoilComponentValue(
            primaryDraggedRecordIdComponentState,
            instanceId,
          );
          const originalSelection = useRecoilComponentValue(
            originalSelectionComponentState,
            instanceId,
          );

          const { startDrag } = useStartRecordDrag('board', instanceId);

          return {
            startDrag,
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
        result.current.startDrag(dragStart, selectedRecordIds);
      });

      expect(result.current.isMultiDragActive).toBe(true);
      expect(result.current.draggedRecordIds).toEqual(['record-1']);
      expect(result.current.primaryDraggedRecordId).toBe('record-1');
      expect(result.current.originalSelection).toEqual(['record-1']);
    });
  });

  describe('Table context', () => {
    it('should set single drag state when dragged record is not in selection', () => {
      const instanceId = 'test-instance';

      const { result } = renderHook(
        () => {
          const isMultiDragActive = useRecoilComponentValue(
            isMultiDragActiveTableComponentState,
            instanceId,
          );
          const draggedRecordIds = useRecoilComponentValue(
            draggedRecordIdsTableComponentState,
            instanceId,
          );
          const primaryDraggedRecordId = useRecoilComponentValue(
            primaryDraggedRecordIdTableComponentState,
            instanceId,
          );
          const originalSelection = useRecoilComponentValue(
            originalSelectionTableComponentState,
            instanceId,
          );

          const { startDrag } = useStartRecordDrag('table', instanceId);

          return {
            startDrag,
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
        result.current.startDrag(dragStart, selectedRecordIds);
      });

      expect(result.current.isMultiDragActive).toBe(true);
      expect(result.current.draggedRecordIds).toEqual(['record-1']);
      expect(result.current.primaryDraggedRecordId).toBe('record-1');
      expect(result.current.originalSelection).toEqual(['record-1']);
    });

    it('should set multi drag state when multiple records are selected', () => {
      const instanceId = 'test-instance';

      const { result } = renderHook(
        () => {
          const isMultiDragActive = useRecoilComponentValue(
            isMultiDragActiveTableComponentState,
            instanceId,
          );
          const draggedRecordIds = useRecoilComponentValue(
            draggedRecordIdsTableComponentState,
            instanceId,
          );
          const primaryDraggedRecordId = useRecoilComponentValue(
            primaryDraggedRecordIdTableComponentState,
            instanceId,
          );
          const originalSelection = useRecoilComponentValue(
            originalSelectionTableComponentState,
            instanceId,
          );

          const { startDrag } = useStartRecordDrag('table', instanceId);

          return {
            startDrag,
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
        result.current.startDrag(dragStart, selectedRecordIds);
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
});
