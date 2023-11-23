import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { boardCardIdsByColumnIdFamilyState } from '@/ui/object/record-board/states/boardCardIdsByColumnIdFamilyState';

export const useCreateOpportunity = () => {
  const { createOneObject: createOneOpportunity } =
    useCreateOneObjectRecord<Opportunity>({
      objectNameSingular: 'opportunity',
    });

  const createOpportunity = useRecoilCallback(
    ({ set }) =>
      async (companyId: string, pipelineStepId: string) => {
        const newUuid = v4();

        set(boardCardIdsByColumnIdFamilyState(pipelineStepId), (oldValue) => [
          ...oldValue,
          newUuid,
        ]);

        await createOneOpportunity?.({
          id: newUuid,
          pipelineStepId,
          companyId: companyId,
        });
      },
    [createOneOpportunity],
  );

  return { createOpportunity };
};
