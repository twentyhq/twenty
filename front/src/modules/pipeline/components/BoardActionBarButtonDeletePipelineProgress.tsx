import { getOperationName } from '@apollo/client/utilities';
import { useRecoilCallback } from 'recoil';

import { IconTrash } from '@/ui/icon/index';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';
import { useDeleteManyPipelineProgressMutation } from '~/generated/graphql';

import { GET_PIPELINES } from '../queries';
import { boardCardIdsByColumnIdFamilyState } from '../states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '../states/boardColumnsState';
import { selectedBoardCardIdsState } from '../states/selectedBoardCardIdsState';

export function BoardActionBarButtonDeleteBoardCard() {
  const [deletePipelineProgress] = useDeleteManyPipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const deleteBoardCardIds = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const boardCardIdsToDelete = snapshot
          .getLoadable(selectedBoardCardIdsState)
          .getValue();

        const boardColumns = snapshot.getLoadable(boardColumnsState).getValue();

        for (const boardColumn of boardColumns) {
          const boardColumnCardIds = snapshot
            .getLoadable(boardCardIdsByColumnIdFamilyState(boardColumn.id))
            .getValue();

          const newBoardColumnCardIds = boardColumnCardIds.filter(
            (cardId) => !boardCardIdsToDelete.includes(cardId),
          );

          if (newBoardColumnCardIds.length !== boardColumnCardIds.length) {
            set(
              boardCardIdsByColumnIdFamilyState(boardColumn.id),
              newBoardColumnCardIds,
            );
          }
        }

        set(selectedBoardCardIdsState, []);

        return boardCardIdsToDelete;
      },
    [],
  );

  async function handleDeleteClick() {
    const deletedCardIds = deleteBoardCardIds();

    await deletePipelineProgress({
      variables: {
        ids: deletedCardIds,
      },
    });
  }

  return (
    <EntityTableActionBarButton
      label="Delete"
      icon={<IconTrash size={16} />}
      type="warning"
      onClick={handleDeleteClick}
    />
  );
}
