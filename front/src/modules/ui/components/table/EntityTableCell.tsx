import { useEffect } from 'react';
import { flexRender } from '@tanstack/react-table';
import { Cell, Row } from '@tanstack/table-core';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '@/ui/tables/states/CellContext';
import { contextMenuPositionState } from '@/ui/tables/states/contextMenuPositionState';
import { currentColumnNumberScopedState } from '@/ui/tables/states/currentColumnNumberScopedState';
import { currentRowSelectionState } from '@/ui/tables/states/rowSelectionState';

export function EntityTableCell<TData extends { id: string }>({
  row,
  cell,
  cellIndex,
}: {
  row: Row<TData>;
  cell: Cell<TData, unknown>;
  cellIndex: number;
}) {
  const [, setCurrentRowSelection] = useRecoilState(currentRowSelectionState);

  const [, setCurrentColumnNumber] = useRecoilScopedState(
    currentColumnNumberScopedState,
    CellContext,
  );

  useEffect(() => {
    setCurrentColumnNumber(cellIndex);
  }, [cellIndex, setCurrentColumnNumber]);

  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);

  function handleContextMenu(event: React.MouseEvent, id: string) {
    event.preventDefault();
    setCurrentRowSelection((prev) => ({ ...prev, [id]: true }));

    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <td
      onContextMenu={(event) => handleContextMenu(event, row.original.id)}
      style={{
        width: cell.column.getSize(),
        minWidth: cell.column.getSize(),
        maxWidth: cell.column.getSize(),
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}
