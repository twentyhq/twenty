import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { Opportunity } from '@/pipeline/types/Opportunity';

import { useRemoveRecordBoardCardIdsInternal } from './useRemoveRecordBoardCardIdsInternal';

export const useDeleteSelectedRecordBoardCardsInternal = () => {
  const removeCardIds = useRemoveRecordBoardCardIdsInternal();
  const apolloClient = useApolloClient();

  const { deleteManyRecords: deleteManyOpportunities } =
    useDeleteManyRecords<Opportunity>({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
    });

  const { selectedCardIdsSelector } = useRecordBoardScopedStates();

  const deleteSelectedBoardCards = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const selectedCardIds = snapshot
          .getLoadable(selectedCardIdsSelector)
          .getValue();

        await deleteManyOpportunities?.(selectedCardIds);
        removeCardIds(selectedCardIds);
        selectedCardIds.forEach((id) => {
          apolloClient.cache.evict({ id: `Opportunity:${id}` });
        });
      },
    [
      selectedCardIdsSelector,
      removeCardIds,
      deleteManyOpportunities,
      apolloClient.cache,
    ],
  );

  return deleteSelectedBoardCards;
};
