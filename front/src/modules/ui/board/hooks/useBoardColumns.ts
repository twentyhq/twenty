import { useRecoilState } from 'recoil';

import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const useBoardColumnns = () => {
  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

  const handleColumnMove = (
    direction: string,
    column: BoardColumnDefinition,
  ) => {
    const currentColumnArrayIndex = boardColumns.findIndex(
      (tableColumn) => tableColumn.id === column.id,
    );

    const targetColumnArrayIndex =
      direction === 'left'
        ? currentColumnArrayIndex - 1
        : currentColumnArrayIndex + 1;

    if (currentColumnArrayIndex >= 0) {
      const currentColumn = boardColumns[currentColumnArrayIndex];
      const targetColumn = boardColumns[targetColumnArrayIndex];

      const newTableColumns = [...boardColumns];
      newTableColumns[currentColumnArrayIndex] = {
        ...targetColumn,
        index: currentColumn.index,
      };
      newTableColumns[targetColumnArrayIndex] = {
        ...currentColumn,
        index: targetColumn.index,
      };

      setBoardColumns([...newTableColumns]);
    }
  };

  const handleColumnLeftMove = (column: BoardColumnDefinition) => {
    handleColumnMove('left', column);
  };

  const handleColumnRightMove = (column: BoardColumnDefinition) => {
    handleColumnMove('right', column);
  };

  return { handleColumnLeftMove, handleColumnRightMove };
};
