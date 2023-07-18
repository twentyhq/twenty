import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { CellContext } from '../states/CellContext';
import { contextMenuPositionState } from '../states/contextMenuPositionState';
import { currentColumnNumberScopedState } from '../states/currentColumnNumberScopedState';

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
