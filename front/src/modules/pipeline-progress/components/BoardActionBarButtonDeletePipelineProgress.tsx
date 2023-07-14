import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { EntityTableActionBarButton } from '@/ui/components/table/action-bar/EntityTableActionBarButton';
import { IconTrash } from '@/ui/icons/index';
import { useDeleteManyPipelineProgressMutation } from '~/generated/graphql';

import { GET_PIPELINES } from '../queries';
import { boardItemsState } from '../states/boardItemsState';
import { selectedBoardCardsState } from '../states/selectedBoardCardsState';

export function BoardActionBarButtonDeletePipelineProgress() {
  const [selectedBoardItems, setSelectedBoardItems] = useRecoilState(
    selectedBoardCardsState,
  );
  const [boardItems, setBoardItems] = useRecoilState(boardItemsState);

  const [deletePipelineProgress] = useDeleteManyPipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  async function handleDeleteClick() {
    await deletePipelineProgress({
      variables: {
        ids: selectedBoardItems,
      },
    });

    setBoardItems(
      Object.fromEntries(
        Object.entries(boardItems).filter(
          ([key]) => !selectedBoardItems.includes(key),
        ),
      ),
    );
    setSelectedBoardItems([]);
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
