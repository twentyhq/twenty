import { RECORD_INDEX_FOCUS_ID } from '@/object-record/record-index/constants/RecordIndexFocusId';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useSetIsRecordTableFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsRecordTableFocusActive';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const resetTableRowSelection = useResetTableRowSelection(
    recordTableIdFromContext,
  );

  const { setIsFocusActiveForCurrentPosition } = useSetIsRecordTableFocusActive(
    recordTableIdFromContext,
  );

  const setRecordTableHoverPosition = useSetRecoilComponentStateV2(
    recordTableHoverPositionComponentState,
    recordTableIdFromContext,
  );

  const { unfocusRecordTableRow } = useFocusedRecordTableRow(
    recordTableIdFromContext,
  );

  const { deactivateRecordTableRow } = useActiveRecordTableRow(
    recordTableIdFromContext,
  );

  const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();

  return () => {
    resetTableRowSelection();

    setIsFocusActiveForCurrentPosition(false);

    unfocusRecordTableRow();

    deactivateRecordTableRow();

    setRecordTableHoverPosition(null);

    resetFocusStackToFocusItem({
      focusStackItem: {
        focusId: RECORD_INDEX_FOCUS_ID,
        componentInstance: {
          componentType: FocusComponentType.PAGE,
          componentInstanceId: RECORD_INDEX_FOCUS_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: true,
        },
      },
      hotkeyScope: {
        scope: RecordIndexHotkeyScope.RecordIndex,
        customScopes: {
          goto: true,
          keyboardShortcutMenu: true,
          searchRecords: true,
        },
      },
    });
  };
};
