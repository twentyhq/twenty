import { selectorFamily } from 'recoil';

import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';

import { boardCardIdsByColumnIdFamilyState } from './boardCardIdsByColumnIdFamilyState';

// TODO: this state should be computed during the synchronization hook and put in a generic
// boardColumnTotalsFamilyState indexed by columnId.
export const boardColumnTotalsFamilySelector = selectorFamily({
  key: 'boardColumnTotalsFamilySelector',
  get:
    (pipelineStageId: string) =>
    ({ get }) => {
      const cardIds = get(boardCardIdsByColumnIdFamilyState(pipelineStageId));

      const pipelineProgresses = cardIds.map((pipelineProgressId: string) =>
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
