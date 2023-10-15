import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { ViewFieldForVisibility } from '@/ui/view-bar/types/ViewFieldForVisibility';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';
import { useUpdatePipelineStageMutation } from '~/generated/graphql';

import { boardColumnsState } from '../states/boardColumnsState';
import { savedBoardColumnsState } from '../states/savedBoardColumnsState';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const useBoardColumns = () => {
  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);
  const [, setSavedBoardColumns] = useRecoilState(savedBoardColumnsState);

  const { handleColumnMove } = useMoveViewColumns();

  const [updatePipelineStageMutation] = useUpdatePipelineStageMutation();

  const updatePipelineStages = useCallback(
    (stages: BoardColumnDefinition[]) => {
      if (!stages.length) return;

      stages.map((stage) =>
        updatePipelineStageMutation({
          variables: {
            data: {
              index: stage.index,
              isVisible: stage.isVisible,
            },
            id: stage.id,
          },
        }),
      );
    },
    [updatePipelineStageMutation],
  );

  const persistBoardColumns = () => {
    updatePipelineStages(boardColumns);
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
    setSavedBoardColumns(columns);
    updatePipelineStages(columns);
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
    (columns: ViewFieldForVisibility[]) => {
      const updatedColumns = columns.map(
        (column, index) =>
          ({
            ...column,
            index,
          } as BoardColumnDefinition),
      );
      setBoardColumns(updatedColumns);
      setSavedBoardColumns(updatedColumns);
      updatePipelineStages(updatedColumns);
    },
    [setBoardColumns, setSavedBoardColumns, updatePipelineStages],
  );

  return {
    handleMoveBoardColumn,
    persistBoardColumns,
    handleColumnVisibilityChange,
    handleColumnReorder,
  };
};
