import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useDeleteOneObjectRecord } from '@/object-record/hooks/useDeleteOneObjectRecord';
import { Opportunity } from '@/pipeline/types/Opportunity';

import { selectedCardIdsSelector } from '../states/selectors/selectedCardIdsSelector';

import { useRemoveCardIds } from './useRemoveCardIds';

export const useDeleteSelectedBoardCards = () => {
  const removeCardIds = useRemoveCardIds();
  const apolloClient = useApolloClient();

  const { deleteOneObject: deleteOneOpportunity } =
    useDeleteOneObjectRecord<Opportunity>({
      objectNameSingular: 'opportunity',
    });

  const deleteSelectedBoardCards = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const selectedCardIds = snapshot
          .getLoadable(selectedCardIdsSelector)
          .getValue();

        await Promise.all(
          selectedCardIds.map(async (id) => {
            await deleteOneOpportunity?.(id);
          }),
        );
        removeCardIds(selectedCardIds);
        selectedCardIds.forEach((id) => {
          apolloClient.cache.evict({ id: `Opportunity:${id}` });
        });
      },
    [apolloClient.cache, deleteOneOpportunity, removeCardIds],
  );

  return deleteSelectedBoardCards;
};
