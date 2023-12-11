import { PropsWithChildren, useEffect, useRef } from 'react';
import { Key } from 'ts-key-enum';

import { useIsFieldInputOnly } from '@/object-record/field/hooks/useIsFieldInputOnly';
import { useToggleEditOnlyInput } from '@/object-record/field/hooks/useToggleEditOnlyInput';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellDisplayContainer } from './RecordTableCellDisplayContainer';

type TableCellSoftFocusModeProps = PropsWithChildren<unknown>;

export const TableCellSoftFocusMode = ({
  children,
}: TableCellSoftFocusModeProps) => {
  const { openTableCell } = useTableCell();

  const isFieldInputOnly = useIsFieldInputOnly();
  const toggleEditOnlyInput = useToggleEditOnlyInput();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  useScopedHotkeys(
    [Key.Backspace, Key.Delete],
    () => {
      if (!isFieldInputOnly) {
        openTableCell({
          initialValue: {
            isEmpty: true,
          },
        });
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [openTableCell],
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
          initialValue: {
            value: keyboardEvent.key,
          },
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
    <TableCellDisplayContainer
      onClick={handleClick}
      softFocus
      scrollRef={scrollRef}
    >
      {children}
    </TableCellDisplayContainer>
  );
};
