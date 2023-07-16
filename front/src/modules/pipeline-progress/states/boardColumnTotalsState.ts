import { selector } from 'recoil';

import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';

import { boardState } from './boardState';

export const boardColumnTotalsState = selector({
  key: 'BoardColumnTotals',
  get: ({ get }) => {
    const board = get(boardState);
    const totals: { [pipelineStageId: string]: number } = {};
    board?.forEach((pipelineStage: BoardPipelineStageColumn) => {
      const pipelineProgresses = pipelineStage.pipelineProgressIds.map(
        (pipelineProgressId: string) =>
          get(companyProgressesFamilyState(pipelineProgressId)),
      );
      const pipelineStageTotal: number = pipelineProgresses.reduce(
        (acc: number, curr: any) => acc + curr?.pipelineProgress.amount,
        0,
      );
      totals[pipelineStage.pipelineStageId] = pipelineStageTotal;
    });
    return totals;
  },
});
