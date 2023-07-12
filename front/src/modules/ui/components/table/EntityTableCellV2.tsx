import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '@/ui/tables/states/CellContext';
import { contextMenuPositionState } from '@/ui/tables/states/contextMenuPositionState';
import { currentColumnNumberScopedState } from '@/ui/tables/states/currentColumnNumberScopedState';
import { currentRowSelectionState } from '@/ui/tables/states/rowSelectionState';

export function EntityTableCell({
  rowId,
  cellIndex,
  children,
  size,
}: {
  size: number;
  rowId: string;
  cellIndex: number;
  children: React.ReactNode;
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
      onContextMenu={(event) => handleContextMenu(event, rowId)}
      style={{
        width: size,
        minWidth: size,
        maxWidth: size,
      }}
    >
      {children}
    </td>
  );
}
