import { PropsWithChildren, useContext, useEffect, useRef } from 'react';

import { FieldContext } from '@/ui/data/field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/ui/data/field/hooks/useIsFieldInputOnly';
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

  const { ref: fieldRef } = useContext(FieldContext);

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
        // Maybe check for probability field
        fieldRef?.current?.click();
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
