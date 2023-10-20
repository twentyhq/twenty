import { PropsWithChildren, useEffect, useRef } from 'react';

import { useIsFieldInputOnly } from '@/ui/data/field/hooks/useIsFieldInputOnly';
import { useToggleEditOnlyInput } from '@/ui/data/field/hooks/useToggleEditOnlyInput';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellDisplayContainer } from './TableCellDisplayContainer';

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
    'enter',
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

        openTableCell();
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
