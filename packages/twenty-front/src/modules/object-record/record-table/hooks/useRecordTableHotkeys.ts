import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useClearField } from '@/object-record/record-field/hooks/useClearField';
import { useIsFieldClearable } from '@/object-record/record-field/hooks/useIsFieldClearable';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useToggleEditOnlyInput } from '@/object-record/record-field/hooks/useToggleEditOnlyInput';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';

export const useRecordTableHotkeys = (focusId: string) => {
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { isReadOnly } = useContext(FieldContext);

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

  useHotkeysOnFocusedElement({
    keys: [Key.Backspace, Key.Delete],
    callback: handleBackspaceOrDelete,
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [handleBackspaceOrDelete],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: handleEnter,
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [handleEnter],
  });

  useHotkeysOnFocusedElement({
    keys: ['*'],
    callback: handleAnyKey,
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [handleAnyKey],
  });
};
