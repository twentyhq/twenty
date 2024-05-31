import { useNavigate } from 'react-router-dom';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useInitDraftValueV2 } from '@/object-record/record-field/hooks/useInitDraftValueV2';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/SoftFocusClickOutsideListenerId';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { useMoveEditModeToTableCellPosition } from '@/object-record/record-table/hooks/internal/useMoveEditModeToCellPosition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from '~/utils/isDefined';

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
  customCellHotkeyScope: HotkeyScope | null;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  entityId: string;
  isActionButtonClick: boolean;
};

export const useOpenRecordTableCellV2 = (tableScopeId: string) => {
  const moveEditModeToTableCellPosition =
    useMoveEditModeToTableCellPosition(tableScopeId);

  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const navigate = useNavigate();
  const leaveTableFocus = useLeaveTableFocus(tableScopeId);
  const { toggleClickOutsideListener } = useClickOutsideListener(
    SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const initDraftValue = useInitDraftValueV2();

  const { openRightDrawer } = useRightDrawer();
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const openTableCell = useRecoilCallback(
    ({ snapshot }) =>
      ({
        initialValue,
        cellPosition,
        isReadOnly,
        pathToShowPage,
        objectNameSingular,
        customCellHotkeyScope,
        fieldDefinition,
        entityId,
        isActionButtonClick,
      }: OpenTableCellArgs) => {
        if (isReadOnly) {
          return;
        }

        const isFirstColumnCell = cellPosition.column === 0;

        const fieldValue = getSnapshotValue(
          snapshot,
          recordStoreFamilySelector({
            recordId: entityId,
            fieldName: fieldDefinition.metadata.fieldName,
          }),
        );

        const isEmpty = isFieldValueEmpty({
          fieldDefinition,
          fieldValue,
        });

        if (isFirstColumnCell && !isEmpty && !isActionButtonClick) {
          leaveTableFocus();
          navigate(pathToShowPage);

          return;
        }

        if (isFirstColumnCell && !isEmpty && isActionButtonClick) {
          leaveTableFocus();
          setViewableRecordId(entityId);
          setViewableRecordNameSingular(objectNameSingular);
          openRightDrawer(RightDrawerPages.ViewRecord);

          return;
        }

        setDragSelectionStartEnabled(false);

        moveEditModeToTableCellPosition(cellPosition);

        initDraftValue({
          value: initialValue,
          entityId,
          fieldDefinition,
        });

        toggleClickOutsideListener(false);

        if (isDefined(customCellHotkeyScope)) {
          setHotkeyScope(
            customCellHotkeyScope.scope,
            customCellHotkeyScope.customScopes,
          );
        } else {
          setHotkeyScope(
            DEFAULT_CELL_SCOPE.scope,
            DEFAULT_CELL_SCOPE.customScopes,
          );
        }
      },
    [
      setDragSelectionStartEnabled,
      toggleClickOutsideListener,
      leaveTableFocus,
      setHotkeyScope,
      initDraftValue,
      moveEditModeToTableCellPosition,
      openRightDrawer,
      setViewableRecordId,
      setViewableRecordNameSingular,
      navigate,
    ],
  );

  return {
    openTableCell,
  };
};
