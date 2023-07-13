import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useCurrentRowSelected } from '@/ui/tables/hooks/useCurrentRowSelected';
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

  const { setCurrentRowSelected } = useCurrentRowSelected();

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();

    setCurrentRowSelected(true);

    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <td
      onContextMenu={(event) => handleContextMenu(event)}
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
