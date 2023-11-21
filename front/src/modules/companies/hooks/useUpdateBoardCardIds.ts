import { useRecoilCallback } from 'recoil';

import { Opportunity } from '@/pipeline/types/Opportunity';
import { boardCardIdsByColumnIdFamilyState } from '@/ui/layout/board/states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '@/ui/layout/board/states/boardColumnsState';

export const useUpdateCompanyBoardCardIds = () =>
  useRecoilCallback(
    ({ snapshot, set }) =>
      (pipelineProgresses: Opportunity[]) => {
        const boardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        for (const boardColumn of boardColumns) {
          const boardCardIds = pipelineProgresses
            .filter(
              (pipelineProgressToFilter) =>
                pipelineProgressToFilter.pipelineStageId === boardColumn.id,
            )
            .map((pipelineProgress) => pipelineProgress.id);

          set(boardCardIdsByColumnIdFamilyState(boardColumn.id), boardCardIds);
        }
      },
    [],
  );
