import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-drag/board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/board/states/primaryDraggedRecordIdComponentState';
import { useEndRecordDrag } from '@/object-record/record-drag/shared/hooks/useEndRecordDrag';
import { draggedRecordIdsTableComponentState } from '@/object-record/record-drag/table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-drag/table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-drag/table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-drag/table/states/primaryDraggedRecordIdTableComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

describe('useEndRecordDrag', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot>{children}</RecoilRoot>
  );

  describe('Board context', () => {
    it('should clear all board drag states', () => {
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

          const { endDrag } = useEndRecordDrag('board', instanceId);

          return {
            endDrag,
            isMultiDragActive,
            draggedRecordIds,
            primaryDraggedRecordId,
            originalSelection,
            setIsMultiDragActive,
            setDraggedRecordIds,
            setPrimaryDraggedRecordId,
            setOriginalSelection,
          };
        },
        { wrapper: Wrapper },
      );

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

      expect(result.current.isMultiDragActive).toBe(true);
      expect(result.current.draggedRecordIds).toEqual(['record-1', 'record-2']);
      expect(result.current.primaryDraggedRecordId).toBe('record-1');
      expect(result.current.originalSelection).toEqual([
        'record-1',
        'record-2',
        'record-3',
      ]);

      act(() => {
        result.current.endDrag();
      });

      expect(result.current.isMultiDragActive).toBe(false);
      expect(result.current.draggedRecordIds).toEqual([]);
      expect(result.current.primaryDraggedRecordId).toBeNull();
      expect(result.current.originalSelection).toEqual([]);
    });
  });

  describe('Table context', () => {
    it('should clear all table drag states', () => {
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

          const { endDrag } = useEndRecordDrag('table', instanceId);

          return {
            endDrag,
            isMultiDragActive,
            draggedRecordIds,
            primaryDraggedRecordId,
            originalSelection,
            setIsMultiDragActive,
            setDraggedRecordIds,
            setPrimaryDraggedRecordId,
            setOriginalSelection,
          };
        },
        { wrapper: Wrapper },
      );

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

      expect(result.current.isMultiDragActive).toBe(true);
      expect(result.current.draggedRecordIds).toEqual(['record-1', 'record-2']);
      expect(result.current.primaryDraggedRecordId).toBe('record-1');
      expect(result.current.originalSelection).toEqual([
        'record-1',
        'record-2',
        'record-3',
      ]);

      act(() => {
        result.current.endDrag();
      });

      expect(result.current.isMultiDragActive).toBe(false);
      expect(result.current.draggedRecordIds).toEqual([]);
      expect(result.current.primaryDraggedRecordId).toBeNull();
      expect(result.current.originalSelection).toEqual([]);
    });
  });
});
