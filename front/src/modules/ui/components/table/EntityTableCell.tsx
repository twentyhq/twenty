import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '@/ui/tables/states/CellContext';
import { contextMenuPositionState } from '@/ui/tables/states/contextMenuPositionState';
import { currentColumnNumberScopedState } from '@/ui/tables/states/currentColumnNumberScopedState';

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
    // TODO: set currently selected

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
