import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { GET_PIPELINES } from '@/pipeline/queries';
import { IconTrash } from '@/ui/icon/index';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';
import { useDeleteManyPipelineProgressMutation } from '~/generated/graphql';

import { useRemoveCardIds } from '../hooks/useRemoveCardIds';
import { selectedCardIdsSelector } from '../states/selectors/selectedCardIdsSelector';

export function BoardActionBarButtonDeleteBoardCard() {
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  const removeCardIds = useRemoveCardIds();

  const [deletePipelineProgress] = useDeleteManyPipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  async function handleDelete() {
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
  }

  return (
    <EntityTableActionBarButton
      label="Delete"
      icon={<IconTrash size={16} />}
      type="warning"
      onClick={() => handleDelete()}
    />
  );
}
