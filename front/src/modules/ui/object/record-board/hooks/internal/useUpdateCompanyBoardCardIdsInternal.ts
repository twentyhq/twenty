import { useRecoilCallback } from 'recoil';

import { Opportunity } from '@/pipeline/types/Opportunity';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';
import { recordBoardCardIdsByColumnIdFamilyState } from '@/ui/object/record-board/states/recordBoardCardIdsByColumnIdFamilyState';

export const useUpdateCompanyBoardCardIdsInternal = () => {
  const { boardColumnsState } = useRecordBoardScopedStates();

  return useRecoilCallback(
    ({ snapshot, set }) =>
      (pipelineProgresses: Pick<Opportunity, 'pipelineStepId' | 'id'>[]) => {
        const boardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        for (const boardColumn of boardColumns) {
          const boardCardIds = pipelineProgresses
            .filter((pipelineProgressToFilter) => {
              return pipelineProgressToFilter.pipelineStepId === boardColumn.id;
            })
            .map((pipelineProgress) => pipelineProgress.id);

          set(
            recordBoardCardIdsByColumnIdFamilyState(boardColumn.id),
            boardCardIds,
          );
        }
      },
    [boardColumnsState],
  );
};
