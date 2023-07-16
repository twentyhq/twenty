import { selectorFamily } from 'recoil';

import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';

import { boardState } from './boardState';

export const boardColumnTotalsFamilyState = selectorFamily({
  key: 'BoardColumnTotalsFamily',
  get:
    (pipelineStageId: string) =>
    ({ get }) => {
      const board = get(boardState);
      const pipelineStage = board?.find(
        (pipelineStage: BoardPipelineStageColumn) =>
          pipelineStage.pipelineStageId === pipelineStageId,
      );

      const pipelineProgresses = pipelineStage?.pipelineProgressIds.map(
        (pipelineProgressId: string) =>
          get(companyProgressesFamilyState(pipelineProgressId)),
      );
      const pipelineStageTotal: number =
        pipelineProgresses?.reduce(
          (acc: number, curr: any) => acc + curr?.pipelineProgress.amount,
          0,
        ) || 0;

      return pipelineStageTotal;
    },
});
