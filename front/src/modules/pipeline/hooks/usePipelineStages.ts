import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { BoardColumnDefinition } from '@/ui/board/types/BoardColumnDefinition';
import {
  useCreatePipelineStageMutation,
  useDeletePipelineStageMutation,
} from '~/generated/graphql';

import { GET_PIPELINES } from '../graphql/queries/getPipelines';
import { currentPipelineState } from '../states/currentPipelineState';

export const usePipelineStages = () => {
  const currentPipeline = useRecoilValue(currentPipelineState);

  const [createPipelineStageMutation] = useCreatePipelineStageMutation();
  const [deletePipelineStageMutation] = useDeletePipelineStageMutation();

  const handlePipelineStageAdd = async (boardColumn: BoardColumnDefinition) => {
    if (!currentPipeline?.id) return;

    return createPipelineStageMutation({
      variables: {
        data: {
          color: boardColumn.colorCode ?? 'gray',
          id: boardColumn.id,
          index: boardColumn.index,
          name: boardColumn.title,
          isVisible: true,
          pipeline: { connect: { id: currentPipeline.id } },
          type: 'ongoing',
        },
      },
      refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
    });
  };

  const handlePipelineStageDelete = async (boardColumnId: string) => {
    if (!currentPipeline?.id) return;

    return deletePipelineStageMutation({
      variables: { where: { id: boardColumnId } },
      refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
    });
  };

  return { handlePipelineStageAdd, handlePipelineStageDelete };
};
