import { useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import type { BoardColumnDefinition } from '@/ui/board/types/BoardColumnDefinition';
import { useCreatePipelineStageMutation } from '~/generated/graphql';

import { GET_PIPELINES } from '../graphql/queries/getPipelines';
import { currentPipelineState } from '../states/currentPipelineState';

export const usePipelineStages = () => {
  const currentPipeline = useRecoilValue(currentPipelineState);

  const [createPipelineStageMutation] = useCreatePipelineStageMutation();

  const handlePipelineStageAdd = useCallback(
    async (boardColumn: BoardColumnDefinition) => {
      if (!currentPipeline?.id) return;

      return createPipelineStageMutation({
        variables: {
          data: {
            color: boardColumn.colorCode,
            id: boardColumn.id,
            index: boardColumn.index,
            name: boardColumn.title,
            pipeline: { connect: { id: currentPipeline.id } },
            type: 'ongoing',
          },
        },
        refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
      });
    },
    [createPipelineStageMutation, currentPipeline?.id],
  );

  return { handlePipelineStageAdd };
};
