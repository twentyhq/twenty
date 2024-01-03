import { useRecoilCallback } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { BoardColumnDefinition } from '@/object-record/record-board/types/BoardColumnDefinition';
import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { PipelineStep } from '@/pipeline/types/PipelineStep';

export const usePipelineSteps = () => {
  const { createOneRecord: createOnePipelineStep } =
    useCreateOneRecord<PipelineStep>({
      objectNameSingular: CoreObjectNameSingular.PipelineStep,
    });

  const { deleteOneRecord: deleteOnePipelineStep } =
    useDeleteOneRecord<PipelineStep>({
      objectNameSingular: CoreObjectNameSingular.PipelineStep,
    });

  const handlePipelineStepAdd = useRecoilCallback(
    ({ snapshot }) =>
      async (boardColumn: BoardColumnDefinition) => {
        const currentPipeline = await snapshot.getPromise(currentPipelineState);
        if (!currentPipeline?.id) return;

        return createOnePipelineStep?.({
          variables: {
            data: {
              color: boardColumn.colorCode ?? 'gray',
              id: boardColumn.id,
              position: boardColumn.position,
              name: boardColumn.title,
              pipeline: { connect: { id: currentPipeline.id } },
              type: 'ongoing',
            },
          },
        });
      },
    [createOnePipelineStep],
  );

  const handlePipelineStepDelete = useRecoilCallback(
    ({ snapshot }) =>
      async (boardColumnId: string) => {
        const currentPipeline = await snapshot.getPromise(currentPipelineState);
        if (!currentPipeline?.id) return;

        return deleteOnePipelineStep?.(boardColumnId);
      },
    [deleteOnePipelineStep],
  );

  return { handlePipelineStepAdd, handlePipelineStepDelete };
};
