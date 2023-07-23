import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { CellContext } from '../states/CellContext';
import { ColumnIndexContext } from '../states/ColumnIndexContext';
import { contextMenuPositionState } from '../states/contextMenuPositionState';
import { currentColumnNumberScopedState } from '../states/currentColumnNumberScopedState';

export function EntityTableCell({
  cellIndex,
  children,
  size,
  rowId,
}: {
  size: number;
  rowId: string;
  cellIndex: number;
  children: React.ReactNode;
}) {
  // const [isInitializing, setIsInitializing] = useState(true);

  // const [currentColumnNumber, setCurrentColumnNumber] = useRecoilScopedState(
  //   currentColumnNumberScopedState,
  //   CellContext,
  // );

  // useEffect(() => {
  //   setCurrentColumnNumber(cellIndex);

  //   setIsInitializing(false);
  // }, [cellIndex, setCurrentColumnNumber]);

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

  // const isInitializing = currentColumnNumber !== cellIndex;

  // if (isInitializing) {
  //   return null;
  // }

  return (
    <ColumnIndexContext.Provider value={cellIndex}>
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
    </ColumnIndexContext.Provider>
  );
}
