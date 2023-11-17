import { useRecoilCallback, useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { boardCardIdsByColumnIdFamilyState } from '@/ui/layout/board/states/boardCardIdsByColumnIdFamilyState';

export const useCreateCompanyProgress = () => {
  const { createOneObject: createOneOpportunity } =
    useCreateOneObjectRecord<Opportunity>({
      objectNameSingular: 'opportunityV2',
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

        await createOneOpportunity?.({
          pipelineStepId: pipelineStageId,
          companyId: companyId,
        });
      },
    [createOneOpportunity, currentPipeline?.id],
  );
};
