import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { ViewFieldForVisibility } from '@/ui/view-bar/types/ViewFieldForVisibility';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';
import { useUpdatePipelineStageMutation } from '~/generated/graphql';

import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const useBoardColumns = () => {
  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

  const { handleColumnMove } = useMoveViewColumns();

  const [updatePipelineStageMutation] = useUpdatePipelineStageMutation();

  const updatedPipelineStages = (stages: BoardColumnDefinition[]) => {
    if (!stages.length) return;

    return Promise.all(
      stages.map((stage) =>
        updatePipelineStageMutation({
          variables: {
            data: {
              index: stage.index,
            },
            id: stage.id,
          },
        }),
      ),
    );
  };

  const persistBoardColumns = async () => {
    await updatedPipelineStages(boardColumns);
  };

  const handleMoveBoardColumn = (
    direction: 'left' | 'right',
    column: BoardColumnDefinition,
  ) => {
    const currentColumnArrayIndex = boardColumns.findIndex(
      (tableColumn) => tableColumn.id === column.id,
    );
    const columns = handleColumnMove(
      direction,
      currentColumnArrayIndex,
      boardColumns,
    );
    setBoardColumns(columns);
  };

  const handleColumnVisibilityChange = (column: ViewFieldForVisibility) => {
    const updatedBoardColumns = boardColumns.map((boardColumn) =>
      boardColumn.key === column.key
        ? { ...boardColumn, isVisible: !column.isVisible }
        : boardColumn,
    );
    setBoardColumns(updatedBoardColumns);
  };

  const handleColumnReorder = useCallback(
    async (columns: BoardColumnDefinition[]) => {
      const updatedColumns = columns.map((column, index) => ({
        ...column,
        index,
      }));
      setBoardColumns(updatedColumns);
      // await handleColumnsChange(updatedColumns);
    },
    [setBoardColumns],
  );

  return {
    handleMoveBoardColumn,
    persistBoardColumns,
    handleColumnVisibilityChange,
    handleColumnReorder,
  };
};
