import { useRecoilCallback, useResetRecoilState } from 'recoil';

import { SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/SoftFocusClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { recordTablePendingRecordIdByGroupComponentFamilyState } from '@/object-record/record-table/states/recordTablePendingRecordIdByGroupComponentFamilyState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { isDefined } from '~/utils/isDefined';
import { useCloseCurrentTableCellInEditMode } from '../../hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useCloseRecordTableCell = (recordTableId: string) => {
  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutsideListener } = useClickOutsideListener(
    SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const pendingRecordIdState = useRecoilComponentCallbackStateV2(
    recordTablePendingRecordIdComponentState,
    recordTableId,
  );
  const recordTablePendingRecordIdByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordTablePendingRecordIdByGroupComponentFamilyState,
      recordTableId,
    );
  const resetRecordTablePendingRecordId =
    useResetRecoilState(pendingRecordIdState);

  const closeTableCell = useRecoilCallback(
    ({ reset }) =>
      async (recordGroupId?: string) => {
        toggleClickOutsideListener(true);
        setDragSelectionStartEnabled(true);
        closeCurrentTableCellInEditMode();
        setHotkeyScope(TableHotkeyScope.TableSoftFocus);
        resetRecordTablePendingRecordId();

        if (isDefined(recordGroupId)) {
          reset(recordTablePendingRecordIdByGroupFamilyState(recordGroupId));
        }
      },
    [
      closeCurrentTableCellInEditMode,
      recordTablePendingRecordIdByGroupFamilyState,
      resetRecordTablePendingRecordId,
      setDragSelectionStartEnabled,
      setHotkeyScope,
      toggleClickOutsideListener,
    ],
  );

  return {
    closeTableCell,
  };
};
