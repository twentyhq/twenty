import { useRecoilCallback } from 'recoil';

import { Opportunity } from '@/pipeline/types/Opportunity';
import { boardCardIdsByColumnIdFamilyState } from '@/ui/object/record-board/states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '@/ui/object/record-board/states/boardColumnsState';

export const useUpdateCompanyBoardCardIds = () =>
  useRecoilCallback(
    ({ snapshot, set }) =>
      (pipelineProgresses: Pick<Opportunity, 'pipelineStepId' | 'id'>[]) => {
        const boardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        for (const boardColumn of boardColumns) {
          const boardCardIds = pipelineProgresses
            .filter(
              (pipelineProgressToFilter) =>
                pipelineProgressToFilter.pipelineStepId === boardColumn.id,
            )
            .map((pipelineProgress) => pipelineProgress.id);

          set(boardCardIdsByColumnIdFamilyState(boardColumn.id), boardCardIds);
        }
      },
    [],
  );
