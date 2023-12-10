import { useRecoilState } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { BoardColumnDefinition } from '../../types/BoardColumnDefinition';

export const useBoardColumnsInternal = () => {
  const { boardColumnsState } = useRecordBoardScopedStates();
  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

  const { handleColumnMove } = useMoveViewColumns();

  const { updateOneRecord: updateOnePipelineStep } =
    useUpdateOneRecord<PipelineStep>({
      objectNameSingular: 'pipelineStep',
    });

  const updatedPipelineSteps = (stages: BoardColumnDefinition[]) => {
    if (!stages.length) return;

    return Promise.all(
      stages.map(
        (stage) =>
          updateOnePipelineStep?.({
            idToUpdate: stage.id,
            input: {
              position: stage.position,
            },
          }),
      ),
    );
  };

  const persistBoardColumns = async () => {
    await updatedPipelineSteps(boardColumns);
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

  return { handleMoveBoardColumn, persistBoardColumns };
};
