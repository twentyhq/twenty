import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { useIsFieldClearable } from '@/object-record/record-field/ui/hooks/useIsFieldClearable';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { useToggleEditOnlyInput } from '@/object-record/record-field/ui/hooks/useToggleEditOnlyInput';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { useListenToSidePanelOpening } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelOpening';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

export const RecordTableCellHotkeysEffect = ({
  cellFocusId,
}: {
  cellFocusId: string;
}) => {
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { isRecordFieldReadOnly: isReadOnly } = useContext(FieldContext);
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

  const { restoreRecordTableRowFocusFromCellPosition } =
    useFocusedRecordTableRow();

  const handleEscape = () => {
    restoreRecordTableRowFocusFromCellPosition();
  };

  useListenToSidePanelOpening(() => onCloseTableCell());

  useHotkeysOnFocusedElement({
    keys: [Key.Backspace, Key.Delete],
    callback: handleBackspaceOrDelete,
    focusId: cellFocusId,
    dependencies: [handleBackspaceOrDelete],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: handleEnter,
    focusId: cellFocusId,
    dependencies: [handleEnter],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId: cellFocusId,
    dependencies: [handleEscape],
  });

  useHotkeysOnFocusedElement({
    keys: ['*'],
    callback: handleAnyKey,
    focusId: cellFocusId,
    dependencies: [handleAnyKey],
    options: {
      preventDefault: false,
    },
  });

  const { selectAllRows } = useSelectAllRows();

  const handleSelectAllRows = () => {
    selectAllRows();
  };

  useHotkeysOnFocusedElement({
    keys: ['ctrl+a,meta+a'],
    callback: handleSelectAllRows,
    focusId: cellFocusId,
    dependencies: [handleSelectAllRows],
    options: {
      enableOnFormTags: false,
    },
  });

  return null;
};
