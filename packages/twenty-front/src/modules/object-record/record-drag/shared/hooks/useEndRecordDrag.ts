import { useRecoilCallback } from 'recoil';

import { RecordDragContext } from '@/object-record/record-drag/shared/types/RecordDragContext';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-drag/board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/board/states/primaryDraggedRecordIdComponentState';

import { draggedRecordIdsTableComponentState } from '@/object-record/record-drag/table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-drag/table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-drag/table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-drag/table/states/primaryDraggedRecordIdTableComponentState';

export const useEndRecordDrag = (
  context: RecordDragContext,
  instanceId?: string,
) => {
  const isMultiDragActiveState = useRecoilComponentCallbackState(
    context === 'board'
      ? isMultiDragActiveComponentState
      : isMultiDragActiveTableComponentState,
    instanceId,
  );

  const draggedRecordIdsState = useRecoilComponentCallbackState(
    context === 'board'
      ? draggedRecordIdsComponentState
      : draggedRecordIdsTableComponentState,
    instanceId,
  );

  const primaryDraggedRecordIdState = useRecoilComponentCallbackState(
    context === 'board'
      ? primaryDraggedRecordIdComponentState
      : primaryDraggedRecordIdTableComponentState,
    instanceId,
  );

  const originalSelectionState = useRecoilComponentCallbackState(
    context === 'board'
      ? originalSelectionComponentState
      : originalSelectionTableComponentState,
    instanceId,
  );

  const endDrag = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isMultiDragActiveState, false);
        set(draggedRecordIdsState, []);
        set(primaryDraggedRecordIdState, null);
        set(originalSelectionState, []);
      },
    [
      isMultiDragActiveState,
      draggedRecordIdsState,
      primaryDraggedRecordIdState,
      originalSelectionState,
    ],
  );

  return { endDrag };
};
