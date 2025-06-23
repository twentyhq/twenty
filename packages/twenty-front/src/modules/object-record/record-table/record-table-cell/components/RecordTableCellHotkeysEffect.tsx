import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useClearField } from '@/object-record/record-field/hooks/useClearField';
import { useIsFieldClearable } from '@/object-record/record-field/hooks/useIsFieldClearable';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useToggleEditOnlyInput } from '@/object-record/record-field/hooks/useToggleEditOnlyInput';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useCurrentlyFocusedRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/hooks/useCurrentlyFocusedRecordTableCellFocusId';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { useListenToSidePanelOpening } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelOpening';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

export const RecordTableCellHotkeysEffect = () => {
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { isReadOnly } = useContext(FieldContext);
  const cellFocusId = useCurrentlyFocusedRecordTableCellFocusId();
  const { onCloseTableCell } = useRecordTableBodyContextOrThrow();

  const isFieldInputOnly = useIsFieldInputOnly();
  const isFieldClearable = useIsFieldClearable();
  const toggleEditOnlyInput = useToggleEditOnlyInput();
  const clearField = useClearField();

  const handleBackspaceOrDelete = () => {
    if (!isFieldInputOnly && isFieldClearable) {
      clearField();
    }
  };

  const handleEnter = () => {
    if (isReadOnly) {
      return;
    }

    if (!isFieldInputOnly) {
      openTableCell();
    } else {
      toggleEditOnlyInput();
    }
  };

  const handleAnyKey = (keyboardEvent: KeyboardEvent) => {
    if (isReadOnly) {
      return;
    }

    if (!isFieldInputOnly) {
      const isWritingText =
        !isNonTextWritingKey(keyboardEvent.key) &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey;

      if (!isWritingText) {
        return;
      }

      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();
      keyboardEvent.stopImmediatePropagation();

      openTableCell(keyboardEvent.key);
    }
  };

  const { recordTableId } = useRecordTableContextOrThrow();

  const { restoreRecordTableRowFocusFromCellPosition } =
    useFocusedRecordTableRow(recordTableId);

  const handleEscape = () => {
    restoreRecordTableRowFocusFromCellPosition();
  };

  useListenToSidePanelOpening(() => onCloseTableCell());

  useHotkeysOnFocusedElement({
    keys: [Key.Backspace, Key.Delete],
    callback: handleBackspaceOrDelete,
    focusId: cellFocusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [handleBackspaceOrDelete],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: handleEnter,
    focusId: cellFocusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [handleEnter],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId: cellFocusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [handleEscape],
  });

  useHotkeysOnFocusedElement({
    keys: ['*'],
    callback: handleAnyKey,
    focusId: cellFocusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [handleAnyKey],
    options: {
      preventDefault: false,
    },
  });

  return null;
};
