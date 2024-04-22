import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/SoftFocusClickOutsideListenerId';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { isDefined } from '~/utils/isDefined';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentTableCellEditMode } from './useCurrentTableCellEditMode';

export const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const useOpenRecordTableCell = () => {
  const { pathToShowPage, isReadOnly } = useContext(RecordTableRowContext);

  const { setCurrentTableCellInEditMode } = useCurrentTableCellEditMode();
  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);

  const navigate = useNavigate();
  const leaveTableFocus = useLeaveTableFocus();
  const { toggleClickOutsideListener } = useClickOutsideListener(
    SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const { columnIndex } = useContext(RecordTableCellContext);
  const isFirstColumnCell = columnIndex === 0;
  const isEmpty = useIsFieldEmpty();

  const { entityId, fieldDefinition } = useContext(FieldContext);

  const { initDraftValue: initFieldInputDraftValue } = useRecordFieldInput(
    `${entityId}-${fieldDefinition?.metadata?.fieldName}`,
  );

  const openTableCell = useRecoilCallback(
    () => (options?: { initialValue?: string }) => {
      if (isReadOnly) {
        return;
      }

      if (isFirstColumnCell && !isEmpty) {
        leaveTableFocus();
        navigate(pathToShowPage);
        return;
      }

      setDragSelectionStartEnabled(false);
      setCurrentTableCellInEditMode();

      initFieldInputDraftValue(options?.initialValue);
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
      isReadOnly,
      isFirstColumnCell,
      isEmpty,
      setDragSelectionStartEnabled,
      setCurrentTableCellInEditMode,
      initFieldInputDraftValue,
      toggleClickOutsideListener,
      customCellHotkeyScope,
      leaveTableFocus,
      navigate,
      pathToShowPage,
      setHotkeyScope,
    ],
  );

  return {
    openTableCell,
  };
};
