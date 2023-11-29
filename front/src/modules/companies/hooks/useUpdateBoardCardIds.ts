import { useRecoilCallback } from 'recoil';

import { Opportunity } from '@/pipeline/types/Opportunity';
import { boardCardIdsByColumnIdFamilyState } from '@/ui/object/record-board/states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsScopedState } from '@/ui/object/record-board/states/boardColumnsScopedState';

export const useUpdateCompanyBoardCardIds = () =>
  useRecoilCallback(
    ({ snapshot, set }) =>
      (pipelineProgresses: Pick<Opportunity, 'pipelineStepId' | 'id'>[]) => {
        const boardColumns = snapshot
          .getLoadable(boardColumnsScopedState)
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
