import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/states/isMultiDragActiveComponentState';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/states/primaryDraggedRecordIdComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

describe('useEndRecordDrag', () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({});

  it('should clear all board drag states', () => {
    const { result } = renderHook(
      () => {
        const [isMultiDragActive, setIsMultiDragActive] = useAtomComponentState(
          isMultiDragActiveComponentState,
        );

        const [draggedRecordIds, setDraggedRecordIds] = useAtomComponentState(
          draggedRecordIdsComponentState,
        );

        const [primaryDraggedRecordId, setPrimaryDraggedRecordId] =
          useAtomComponentState(primaryDraggedRecordIdComponentState);

        const [originalSelection, setOriginalSelection] = useAtomComponentState(
          originalDragSelectionComponentState,
        );

        const { endRecordDrag } = useEndRecordDrag();

        return {
          endRecordDrag,
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
      result.current.setOriginalSelection(['record-1', 'record-2', 'record-3']);
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
      result.current.endRecordDrag();
    });

    expect(result.current.isMultiDragActive).toBe(false);
    expect(result.current.draggedRecordIds).toEqual([]);
    expect(result.current.primaryDraggedRecordId).toBeNull();
    expect(result.current.originalSelection).toEqual([]);
  });
});
