import { useRecoilCallback } from 'recoil';

import { boardCardIdsByColumnIdFamilyState } from '@/ui/board/states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '@/ui/board/states/boardColumnsState';
import { selectedBoardCardIdsState } from '@/ui/board/states/selectedBoardCardIdsState';
import { IconTrash } from '@/ui/icon/index';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';

export function BoardActionBarButtonDeleteBoardCard({
  onDelete,
}: {
  onDelete: (deletedCardIds: string[]) => void;
}) {
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

    onDelete(deletedCardIds);
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
