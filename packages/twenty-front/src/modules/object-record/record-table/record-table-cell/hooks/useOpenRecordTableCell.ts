import { useRecoilCallback } from 'recoil';

import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';

import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useFocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useFocusRecordTableCell';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';

export type OpenTableCellArgs = {
  initialValue?: string;
  cellPosition: TableCellPosition;
  isReadOnly: boolean;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  recordId: string;
  isNavigating: boolean;
};

export const useOpenRecordTableCell = (recordTableId: string) => {
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();

  const clickOutsideListenerIsActivatedState = useRecoilComponentCallbackState(
    clickOutsideListenerIsActivatedComponentState,
    RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
  );
  const setCurrentTableCellInEditModePosition = useSetRecoilComponentState(
    recordTableCellEditModePositionComponentState,
    recordTableId,
  );

  const { setDragSelectionStartEnabled } = useDragSelect();

  const leaveTableFocus = useLeaveTableFocus(recordTableId);
  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const initDraftValue = useInitDraftValue();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { openFieldInput } = useOpenFieldInputEditMode();

  const { activateRecordTableRow, deactivateRecordTableRow } =
    useActiveRecordTableRow(recordTableId);

  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const setIsRowFocusActive = useSetRecoilComponentState(
    isRecordTableRowFocusActiveComponentState,
    recordTableId,
  );

  const { focusRecordTableCell } = useFocusRecordTableCell();

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const openTableCell = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        initialValue,
        cellPosition,
        isReadOnly,
        fieldDefinition,
        recordId,
        isNavigating,
      }: OpenTableCellArgs) => {
        set(clickOutsideListenerIsActivatedState, false);

        const isFirstColumnCell = cellPosition.column === 0;

        const fieldValue = getSnapshotValue(
          snapshot,
          recordStoreFamilySelector({
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

          const openRecordIn = snapshot
            .getLoadable(recordIndexOpenRecordInState)
            .getValue();

          if (openRecordIn === ViewOpenRecordInType.SIDE_PANEL) {
            activateRecordTableRow(cellPosition.row);
            unfocusRecordTableRow();
          }

          openRecordFromIndexView({ recordId });

          return;
        }

        // Block editing for read-only records, but allow navigation (handled above)
        if (isReadOnly) {
          return;
        }

        deactivateRecordTableRow();

        focusRecordTableCell(cellPosition);

        setIsRowFocusActive(false);

        setDragSelectionStartEnabled(false);

        openFieldInput({
          fieldDefinition,
          recordId,
          prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
        });

        setCurrentTableCellInEditModePosition(cellPosition);

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

        setActiveDropdownFocusIdAndMemorizePrevious(
          getDropdownFocusIdForRecordField({
            recordId,
            fieldMetadataId: fieldDefinition.fieldMetadataId,
            componentType: 'table-cell',
            instanceId: scopeInstanceId,
          }),
        );
      },
    [
      clickOutsideListenerIsActivatedState,
      deactivateRecordTableRow,
      focusRecordTableCell,
      setIsRowFocusActive,
      setDragSelectionStartEnabled,
      openFieldInput,
      setCurrentTableCellInEditModePosition,
      initDraftValue,
      toggleClickOutside,
      setActiveDropdownFocusIdAndMemorizePrevious,
      scopeInstanceId,
      leaveTableFocus,
      openRecordFromIndexView,
      activateRecordTableRow,
      unfocusRecordTableRow,
    ],
  );

  return {
    openTableCell,
  };
};
