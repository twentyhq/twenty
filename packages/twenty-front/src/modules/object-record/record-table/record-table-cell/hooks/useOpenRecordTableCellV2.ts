import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useInitDraftValueV2 } from '@/object-record/record-field/hooks/useInitDraftValueV2';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/hooks/useOpenFieldInputEditMode';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';

import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useNavigate } from 'react-router-dom';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
export const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

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

export const useOpenRecordTableCellV2 = (tableScopeId: string) => {
  const clickOutsideListenerIsActivatedState =
    useRecoilComponentCallbackStateV2(
      clickOutsideListenerIsActivatedComponentState,
      RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
    );
  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();
  const setCurrentTableCellInEditModePosition = useSetRecoilComponentStateV2(
    recordTableCellEditModePositionComponentState,
    tableScopeId,
  );

  const { setDragSelectionStartEnabled } = useDragSelect();

  const leaveTableFocus = useLeaveTableFocus(tableScopeId);
  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const initDraftValue = useInitDraftValueV2();

  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const navigate = useNavigate();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { openFieldInput } = useOpenFieldInputEditMode();

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

          if (openRecordIn === ViewOpenRecordInType.RECORD_PAGE) {
            navigate(indexIdentifierUrl(recordId));
          }

          if (openRecordIn === ViewOpenRecordInType.SIDE_PANEL) {
            openRecordInCommandMenu({
              recordId,
              objectNameSingular,
            });
          }

          return;
        }

        if (isFirstColumnCell && !isEmpty && isActionButtonClick) {
          leaveTableFocus();
          setViewableRecordId(recordId);
          setViewableRecordNameSingular(objectNameSingular);

          return;
        }

        setDragSelectionStartEnabled(false);

        openFieldInput({
          fieldDefinition,
          recordId,
        });

        setCurrentTableCellInEditModePosition(cellPosition);

        initDraftValue({
          value: initialValue,
          recordId,
          fieldDefinition,
          fieldComponentInstanceId: getRecordFieldInputId(
            recordId,
            fieldDefinition.metadata.fieldName,
            'record-table-cell',
          ),
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
      setDragSelectionStartEnabled,
      openFieldInput,
      setCurrentTableCellInEditModePosition,
      initDraftValue,
      toggleClickOutside,
      setActiveDropdownFocusIdAndMemorizePrevious,
      leaveTableFocus,
      navigate,
      indexIdentifierUrl,
      openRecordInCommandMenu,
      setViewableRecordId,
      setViewableRecordNameSingular,
    ],
  );

  return {
    openTableCell,
  };
};
