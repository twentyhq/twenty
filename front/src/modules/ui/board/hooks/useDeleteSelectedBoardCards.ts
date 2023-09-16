import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { GET_PIPELINES } from '@/pipeline/graphql/queries/getPipelines';
import { useDeleteManyPipelineProgressMutation } from '~/generated/graphql';

import { selectedCardIdsSelector } from '../states/selectors/selectedCardIdsSelector';

import { useRemoveCardIds } from './useRemoveCardIds';

export const useDeleteSelectedBoardCards = () => {
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  const removeCardIds = useRemoveCardIds();

  const [deletePipelineProgress] = useDeleteManyPipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const deleteSelectedBoardCards = async () => {
    await deletePipelineProgress({
      variables: {
        ids: selectedCardIds,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteManyPipelineProgress: {
          count: selectedCardIds.length,
        },
      },
      update: (cache) => {
        removeCardIds(selectedCardIds);
        selectedCardIds.forEach((id) => {
          cache.evict({ id: `PipelineProgress:${id}` });
        });
      },
    });
  };

  return deleteSelectedBoardCards;
};
