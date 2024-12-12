import { useRecoilCallback } from 'recoil';

import { SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/SoftFocusClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { recordTablePendingRecordIdByGroupComponentFamilyState } from '@/object-record/record-table/states/recordTablePendingRecordIdByGroupComponentFamilyState';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useCloseRecordTableCellInGroup = (recordGroupId: string) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutsideListener } = useClickOutsideListener(
    SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const recordTablePendingRecordIdByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordTablePendingRecordIdByGroupComponentFamilyState,
      recordTableId,
    );

  const closeTableCellInGroup = useRecoilCallback(
    ({ reset }) =>
      () => {
        toggleClickOutsideListener(true);
        setDragSelectionStartEnabled(true);
        closeCurrentTableCellInEditMode();
        setHotkeyScope(TableHotkeyScope.TableSoftFocus);

        reset(recordTablePendingRecordIdByGroupFamilyState(recordGroupId));
      },
    [
      closeCurrentTableCellInEditMode,
      recordGroupId,
      recordTablePendingRecordIdByGroupFamilyState,
      setDragSelectionStartEnabled,
      setHotkeyScope,
      toggleClickOutsideListener,
    ],
  );

  return {
    closeTableCellInGroup,
  };
};
