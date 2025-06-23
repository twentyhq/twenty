import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { useClearField } from '@/object-record/record-field/hooks/useClearField';
import { useIsFieldClearable } from '@/object-record/record-field/hooks/useIsFieldClearable';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useToggleEditOnlyInput } from '@/object-record/record-field/hooks/useToggleEditOnlyInput';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

export const RecordTableFocusModeHotkeysSetterEffect = () => {
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const isFieldClearable = useIsFieldClearable();

  const toggleEditOnlyInput = useToggleEditOnlyInput();

  const clearField = useClearField();

  useScopedHotkeys(
    [Key.Backspace, Key.Delete],
    () => {
      if (!isFieldInputOnly && isFieldClearable) {
        clearField();
      }
    },
    TableHotkeyScope.TableFocus,
    [clearField, isFieldClearable, isFieldInputOnly],
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (isReadOnly) {
        return;
      }

      if (!isFieldInputOnly) {
        openTableCell();
      } else {
        toggleEditOnlyInput();
      }
    },
    TableHotkeyScope.TableFocus,
    [openTableCell, isFieldInputOnly, toggleEditOnlyInput, isReadOnly],
  );

  useScopedHotkeys(
    '*',
    (keyboardEvent) => {
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
    },
    TableHotkeyScope.TableFocus,
    [openTableCell, isFieldInputOnly, toggleEditOnlyInput, isReadOnly],
    {
      preventDefault: false,
    },
  );

  return <></>;
};
