import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-drag/board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/board/states/primaryDraggedRecordIdComponentState';
import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { draggedRecordIdsTableComponentState } from '@/object-record/record-drag/table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-drag/table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-drag/table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-drag/table/states/primaryDraggedRecordIdTableComponentState';

describe('useRecordDragState', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot>{children}</RecoilRoot>
  );

  describe('Board context', () => {
    it('should return current board drag state', () => {
      const instanceId = 'test-instance';

      const { result } = renderHook(
        () => {
          const dragState = useRecordDragState('board', instanceId);

          const setIsMultiDragActive = useSetRecoilState(
            isMultiDragActiveComponentState.atomFamily({
              instanceId,
            }),
          );
          const setDraggedRecordIds = useSetRecoilState(
            draggedRecordIdsComponentState.atomFamily({
              instanceId,
            }),
          );
          const setPrimaryDraggedRecordId = useSetRecoilState(
            primaryDraggedRecordIdComponentState.atomFamily({
              instanceId,
            }),
          );
          const setOriginalSelection = useSetRecoilState(
            originalSelectionComponentState.atomFamily({
              instanceId,
            }),
          );

          return {
            dragState,
            setIsMultiDragActive,
            setDraggedRecordIds,
            setPrimaryDraggedRecordId,
            setOriginalSelection,
          };
        },
        { wrapper: Wrapper },
      );

      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.draggedRecordIds).toEqual([]);
      expect(result.current.dragState.primaryDraggedRecordId).toBeNull();
      expect(result.current.dragState.originalSelection).toEqual([]);

      act(() => {
        result.current.setIsMultiDragActive(true);
        result.current.setDraggedRecordIds(['record-1', 'record-2']);
        result.current.setPrimaryDraggedRecordId('record-1');
        result.current.setOriginalSelection([
          'record-1',
          'record-2',
          'record-3',
        ]);
      });

      expect(result.current.dragState.isDragging).toBe(true);
      expect(result.current.dragState.draggedRecordIds).toEqual([
        'record-1',
        'record-2',
      ]);
      expect(result.current.dragState.primaryDraggedRecordId).toBe('record-1');
      expect(result.current.dragState.originalSelection).toEqual([
        'record-1',
        'record-2',
        'record-3',
      ]);
    });
  });

  describe('Table context', () => {
    it('should return current table drag state', () => {
      const instanceId = 'test-instance';

      const { result } = renderHook(
        () => {
          const dragState = useRecordDragState('table', instanceId);

          const setIsMultiDragActive = useSetRecoilState(
            isMultiDragActiveTableComponentState.atomFamily({
              instanceId,
            }),
          );
          const setDraggedRecordIds = useSetRecoilState(
            draggedRecordIdsTableComponentState.atomFamily({
              instanceId,
            }),
          );
          const setPrimaryDraggedRecordId = useSetRecoilState(
            primaryDraggedRecordIdTableComponentState.atomFamily({
              instanceId,
            }),
          );
          const setOriginalSelection = useSetRecoilState(
            originalSelectionTableComponentState.atomFamily({
              instanceId,
            }),
          );

          return {
            dragState,
            setIsMultiDragActive,
            setDraggedRecordIds,
            setPrimaryDraggedRecordId,
            setOriginalSelection,
          };
        },
        { wrapper: Wrapper },
      );

      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.draggedRecordIds).toEqual([]);
      expect(result.current.dragState.primaryDraggedRecordId).toBeNull();
      expect(result.current.dragState.originalSelection).toEqual([]);

      act(() => {
        result.current.setIsMultiDragActive(true);
        result.current.setDraggedRecordIds(['record-1', 'record-2']);
        result.current.setPrimaryDraggedRecordId('record-1');
        result.current.setOriginalSelection([
          'record-1',
          'record-2',
          'record-3',
        ]);
      });

      expect(result.current.dragState.isDragging).toBe(true);
      expect(result.current.dragState.draggedRecordIds).toEqual([
        'record-1',
        'record-2',
      ]);
      expect(result.current.dragState.primaryDraggedRecordId).toBe('record-1');
      expect(result.current.dragState.originalSelection).toEqual([
        'record-1',
        'record-2',
        'record-3',
      ]);
    });
  });
});
