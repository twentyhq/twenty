import { useRecoilState } from 'recoil';

import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const useBoardColumns = () => {
  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

  const { handleColumnMove } = useMoveViewColumns();

  const { updateOneObject: updateOnePipelineStep } =
    useUpdateOneObjectRecord<PipelineStep>({
      objectNameSingular: 'pipelineStepV2',
    });

  const updatedPipelineStages = (stages: BoardColumnDefinition[]) => {
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

  return { handleMoveBoardColumn, persistBoardColumns };
};
