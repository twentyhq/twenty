import { type OpenTableCellArgs } from '@/object-record/record-table/types/OpenTableCellArgs';
import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useFocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useFocusRecordTableCell';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { useRemoveLastFocusItemFromFocusStackByComponentType } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackByComponentType';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { OpenRecordIn } from 'twenty-shared/types';

export const useOpenRecordTableCell = (recordTableId: string) => {
  const store = useStore();

  const setRecordTableCellEditModePosition = useSetAtomComponentState(
    recordTableCellEditModePositionComponentState,
    recordTableId,
  );

  const { setDragSelectionStartEnabled } = useDragSelect();

  const leaveTableFocus = useLeaveTableFocus(recordTableId);
  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const initDraftValue = useInitDraftValue();

  const { openFieldInput } = useOpenFieldInputEditMode();

  const { removeLastFocusItemFromFocusStackByComponentType } =
    useRemoveLastFocusItemFromFocusStackByComponentType();

  const { activateRecordTableRow, deactivateRecordTableRow } =
    useActiveRecordTableRow(recordTableId);

  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const setIsRecordTableRowFocusActive = useSetAtomComponentState(
    isRecordTableRowFocusActiveComponentState,
    recordTableId,
  );

  const { focusRecordTableCell } = useFocusRecordTableCell();

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const openRecordIn = useResolveOpenRecordIn(objectNameSingular);

  const openTableCell = useCallback(
    ({
      initialValue,
      cellPosition,
      isReadOnly,
      fieldDefinition,
      recordId,
      isNavigating,
    }: OpenTableCellArgs) => {
      store.set(
        clickOutsideListenerIsActivatedComponentState.atomFamily({
          instanceId: RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
        }),
        false,
      );

      const isFirstColumnCell = cellPosition.column === 0;

      const fieldValue = store.get(
        recordStoreFamilySelector.selectorFamily({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
        }),
      );

      const isEmpty = isFieldValueEmpty({
        fieldDefinition,
        fieldValue,
      });

      if ((isFirstColumnCell && !isEmpty) || isNavigating) {
        leaveTableFocus();

        if (openRecordIn === OpenRecordIn.SIDE_PANEL) {
          activateRecordTableRow(cellPosition.row);
          unfocusRecordTableRow();
        }

        openRecordFromIndexView({ recordId });

        return;
      }

      if (isReadOnly) {
        return;
      }

      deactivateRecordTableRow();

      focusRecordTableCell(cellPosition);

      setIsRecordTableRowFocusActive(false);

      setDragSelectionStartEnabled(false);

      openFieldInput({
        fieldDefinition,
        recordId,
        prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
        onFileUploadClose: () => {
          setRecordTableCellEditModePosition(null);
          removeLastFocusItemFromFocusStackByComponentType({
            componentType: FocusComponentType.OPENED_FIELD_INPUT,
          });
        },
      });

      setRecordTableCellEditModePosition(cellPosition);

      initDraftValue({
        value: initialValue,
        recordId,
        fieldDefinition,
        fieldComponentInstanceId: getRecordFieldInputInstanceId({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
        }),
      });

      toggleClickOutside(false);
    },
    [
      deactivateRecordTableRow,
      focusRecordTableCell,
      setIsRecordTableRowFocusActive,
      setDragSelectionStartEnabled,
      openFieldInput,
      setRecordTableCellEditModePosition,
      removeLastFocusItemFromFocusStackByComponentType,
      initDraftValue,
      toggleClickOutside,
      leaveTableFocus,
      openRecordFromIndexView,
      openRecordIn,
      activateRecordTableRow,
      unfocusRecordTableRow,
      store,
    ],
  );

  return {
    openTableCell,
  };
};
