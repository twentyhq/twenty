import { getOperationName } from '@apollo/client/utilities';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { GET_PIPELINE_PROGRESS } from '@/pipeline/graphql/queries/getPipelineProgress';
import { GET_PIPELINES } from '@/pipeline/graphql/queries/getPipelines';
import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { boardCardIdsByColumnIdFamilyState } from '@/ui/board/states/boardCardIdsByColumnIdFamilyState';
import { useCreateOneCompanyPipelineProgressMutation } from '~/generated/graphql';

export const useCreateCompanyProgress = () => {
  const [createOneCompanyPipelineProgress] =
    useCreateOneCompanyPipelineProgressMutation({
      refetchQueries: [
        getOperationName(GET_PIPELINE_PROGRESS) ?? '',
        getOperationName(GET_PIPELINES) ?? '',
      ],
    });

  const [currentPipeline] = useRecoilState(currentPipelineState);

  return useRecoilCallback(
    ({ set }) =>
      async (companyId: string, pipelineStageId: string) => {
        if (!currentPipeline?.id) {
          throw new Error('Pipeline not found');
        }

        const newUuid = v4();

        set(boardCardIdsByColumnIdFamilyState(pipelineStageId), (oldValue) => [
          ...oldValue,
          newUuid,
        ]);

        await createOneCompanyPipelineProgress({
          variables: {
            uuid: newUuid,
            pipelineStageId: pipelineStageId,
            pipelineId: currentPipeline?.id ?? '',
            companyId: companyId,
          },
        });
      },
    [createOneCompanyPipelineProgress, currentPipeline],
  );
};
