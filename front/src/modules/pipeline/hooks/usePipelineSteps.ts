import { useRecoilCallback } from 'recoil';

import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { useDeleteOneObjectRecord } from '@/object-record/hooks/useDeleteOneObjectRecord';
import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { BoardColumnDefinition } from '@/ui/object/record-board/types/BoardColumnDefinition';

export const usePipelineSteps = () => {
  const { createOneObject: createOnePipelineStep } =
    useCreateOneObjectRecord<PipelineStep>({
      objectNameSingular: 'pipelineStep',
    });

  const { deleteOneObject: deleteOnePipelineStep } =
    useDeleteOneObjectRecord<PipelineStep>({
      objectNameSingular: 'pipelineStep',
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
