import { useRecoilCallback } from 'recoil';

import { Opportunity } from '@/pipeline/types/Opportunity';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/useRecordBoardScopedStates';
import { boardCardIdsByColumnIdFamilyState } from '@/ui/object/record-board/states/boardCardIdsByColumnIdFamilyState';

export const useUpdateCompanyBoardCardIds = () => {
  const { boardColumnsState } = useRecordBoardScopedStates();

  return useRecoilCallback(
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
    [boardColumnsState],
  );
};
