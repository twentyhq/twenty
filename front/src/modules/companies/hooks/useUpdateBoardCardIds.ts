import { useRecoilCallback } from 'recoil';

import { boardCardIdsByColumnIdFamilyState } from '@/ui/board/states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '@/ui/board/states/boardColumnsState';
import { GetPipelineProgressQuery } from '~/generated/graphql';

export function useUpdateCompanyBoardCardIds() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      (
        pipelineProgresses: GetPipelineProgressQuery['findManyPipelineProgress'],
      ) => {
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
}
