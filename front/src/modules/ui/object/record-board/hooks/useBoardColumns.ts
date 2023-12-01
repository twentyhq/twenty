import { useRecoilState } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const useBoardColumns = () => {
  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

  const { handleColumnMove } = useMoveViewColumns();

  const { updateOneRecord: updateOnePipelineStep } =
    useUpdateOneRecord<PipelineStep>({
      objectNameSingular: 'pipelineStep',
    });

  const updatedPipelineSteps = (stages: BoardColumnDefinition[]) => {
    if (!stages.length) return;

    return Promise.all(
      stages.map((stage) =>
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
