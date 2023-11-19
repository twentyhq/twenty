import { useRecoilValue } from 'recoil';

import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { useDeleteOneObjectRecord } from '@/object-record/hooks/useDeleteOneObjectRecord';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { BoardColumnDefinition } from '@/ui/layout/board/types/BoardColumnDefinition';

import { currentPipelineState } from '../states/currentPipelineState';

export const usePipelineStages = () => {
  const currentPipeline = useRecoilValue(currentPipelineState);

  const { createOneObject: createOnePipelineStep } =
    useCreateOneObjectRecord<PipelineStep>({
      objectNameSingular: 'pipelineStep',
    });

  const { deleteOneObject: deleteOnePipelineStep } =
    useDeleteOneObjectRecord<PipelineStep>({
      objectNameSingular: 'pipelineStep',
    });

  const handlePipelineStageAdd = async (boardColumn: BoardColumnDefinition) => {
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
  };

  const handlePipelineStageDelete = async (boardColumnId: string) => {
    if (!currentPipeline?.id) return;

    return deleteOnePipelineStep?.(boardColumnId);
  };

  return { handlePipelineStageAdd, handlePipelineStageDelete };
};
