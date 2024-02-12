import { useRecoilState } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { BoardColumnDefinition } from '../../types/BoardColumnDefinition';

export const useBoardColumnsInternal = () => {
  const { boardColumnsState } = useRecordBoardDeprecatedScopedStates();
  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

  const { handleColumnMove } = useMoveViewColumns();

  const { updateOneRecord: updateOnePipelineStep } =
    useUpdateOneRecord<PipelineStep>({
      objectNameSingular: CoreObjectNameSingular.PipelineStep,
    });

  const updatedPipelineSteps = (stages: BoardColumnDefinition[]) => {
    if (!stages.length) return;

    return Promise.all(
      stages.map(
        (stage) =>
          updateOnePipelineStep?.({
            idToUpdate: stage.id,
            updateOneRecordInput: {
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
