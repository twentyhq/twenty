import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';

import { useRemoveRecordBoardDeprecatedCardIdsInternal } from './useRemoveRecordBoardDeprecatedCardIdsInternal';

export const useDeleteSelectedRecordBoardDeprecatedCardsInternal = () => {
  const removeCardIds = useRemoveRecordBoardDeprecatedCardIdsInternal();
  const apolloClient = useApolloClient();

  const { deleteManyRecords: deleteManyOpportunities } = useDeleteManyRecords({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
  });

  const { selectedCardIdsSelector } = useRecordBoardDeprecatedScopedStates();

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
