import { PropsWithChildren, useEffect, useRef } from 'react';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellDisplayContainer } from './TableCellDisplayContainer';

type OwnProps = PropsWithChildren<unknown>;

export const TableCellSoftFocusMode = ({ children }: OwnProps) => {
  const { openTableCell: openEditableCell } = useTableCell();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  const openEditMode = () => {
    openEditableCell();
  };

  useScopedHotkeys(
    'enter',
    () => {
      openEditMode();
    },
    TableHotkeyScope.TableSoftFocus,
    [openEditMode],
  );

  useScopedHotkeys(
    '*',
    (keyboardEvent) => {
      const isWritingText =
        !isNonTextWritingKey(keyboardEvent.key) &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey;

      if (!isWritingText) {
        return;
      }

      openEditMode();
    },
    TableHotkeyScope.TableSoftFocus,
    [openEditMode],
    {
      preventDefault: false,
    },
  );

  const handleClick = () => {
    openEditMode();
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
