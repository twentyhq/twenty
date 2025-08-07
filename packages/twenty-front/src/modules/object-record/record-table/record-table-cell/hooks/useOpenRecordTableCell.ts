import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useInitDraftValue } from '@/object-record/record-field/hooks/useInitDraftValue';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { useOpenFieldInputEditMode } from '@/object-record/record-field/hooks/useOpenFieldInputEditMode';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';

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
  pathToShowPage: string;
  objectNameSingular: string;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  recordId: string;
  isActionButtonClick: boolean;
  isNavigating: boolean;
};

export const useOpenRecordTableCell = (recordTableId: string) => {
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

  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

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
        objectNameSingular,
        fieldDefinition,
        recordId,
        isActionButtonClick,
        isNavigating,
      }: OpenTableCellArgs) => {
        if (isReadOnly) {
          return;
        }

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

        if (
          (isFirstColumnCell && !isEmpty && !isActionButtonClick) ||
          isNavigating
        ) {
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

        if (isFirstColumnCell && !isEmpty && isActionButtonClick) {
          leaveTableFocus();
          setViewableRecordId(recordId);
          setViewableRecordNameSingular(objectNameSingular);

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
          getDropdownFocusIdForRecordField(
            recordId,
            fieldDefinition.fieldMetadataId,
            'table-cell',
          ),
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
      leaveTableFocus,
      activateRecordTableRow,
      unfocusRecordTableRow,
      setViewableRecordId,
      setViewableRecordNameSingular,
      openRecordFromIndexView,
    ],
  );

  return {
    openTableCell,
  };
};
