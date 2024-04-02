import { PropsWithChildren, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { useClearField } from '@/object-record/record-field/hooks/useClearField';
import { useIsFieldClearable } from '@/object-record/record-field/hooks/useIsFieldClearable';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useToggleEditOnlyInput } from '@/object-record/record-field/hooks/useToggleEditOnlyInput';
import { useOpenRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { isSoftFocusUsingMouseState } from '@/object-record/record-table/states/isSoftFocusUsingMouseState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

type RecordTableCellSoftFocusModeProps = PropsWithChildren<unknown>;

export const RecordTableCellSoftFocusMode = ({
  children,
}: RecordTableCellSoftFocusModeProps) => {
  const { openTableCell } = useOpenRecordTableCell();

  const isFieldInputOnly = useIsFieldInputOnly();

  const isFieldClearable = useIsFieldClearable();

  const toggleEditOnlyInput = useToggleEditOnlyInput();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSoftFocusUsingMouse = useRecoilValue(isSoftFocusUsingMouseState);
  const clearField = useClearField();

  useEffect(() => {
    if (!isSoftFocusUsingMouse) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSoftFocusUsingMouse]);

  useScopedHotkeys(
    [Key.Backspace, Key.Delete],
    () => {
      if (!isFieldInputOnly && isFieldClearable) {
        clearField();
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [clearField, isFieldClearable, isFieldInputOnly],
    {
      enabled: !isFieldInputOnly,
    },
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (!isFieldInputOnly) {
        openTableCell();
      } else {
        toggleEditOnlyInput();
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [openTableCell],
  );

  useScopedHotkeys(
    '*',
    (keyboardEvent) => {
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

        openTableCell({
          initialValue: keyboardEvent.key,
        });
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [openTableCell],
    {
      preventDefault: false,
    },
  );

  const handleClick = () => {
    if (!isFieldInputOnly) {
      openTableCell();
    }
  };

  return (
    <RecordTableCellDisplayContainer
      onClick={handleClick}
      softFocus
      scrollRef={scrollRef}
    >
      {children}
    </RecordTableCellDisplayContainer>
  );
};
