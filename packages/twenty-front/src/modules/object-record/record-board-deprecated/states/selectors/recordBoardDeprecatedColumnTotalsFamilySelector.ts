import { selectorFamily } from 'recoil';

import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { amountFormat } from '~/utils/format/amountFormat';

import { recordBoardCardIdsByColumnIdFamilyState } from '../recordBoardCardIdsByColumnIdFamilyState';

// TODO: this state should be computed during the synchronization web-hook and put in a generic
// boardColumnTotalsFamilyState indexed by columnId.
export const recordBoardColumnTotalsFamilySelector = selectorFamily({
  key: 'recordBoardColumnTotalsFamilySelector',
  get:
    (pipelineStepId: string) =>
    ({ get }) => {
      const cardIds = get(
        recordBoardCardIdsByColumnIdFamilyState(pipelineStepId),
      );

      const opportunities = cardIds.map((opportunityId: string) =>
        get(companyProgressesFamilyState(opportunityId)),
      );

      const pipelineStepTotal: number =
        opportunities?.reduce(
          (acc: number, curr: any) =>
            acc + curr?.opportunity.amount.amountMicros / 1000000,
          0,
        ) || 0;

      return amountFormat(pipelineStepTotal);
    },
});
