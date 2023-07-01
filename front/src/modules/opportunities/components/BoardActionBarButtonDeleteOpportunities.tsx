import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { EntityTableActionBarButton } from '@/ui/components/table/action-bar/EntityTableActionBarButton';
import { IconTrash } from '@/ui/icons/index';
import { useDeleteManyPipelineProgressMutation } from '~/generated/graphql';

import { GET_PIPELINES } from '../queries';
import { boardItemsState } from '../states/boardItemsState';
import { selectedBoardItemsState } from '../states/selectedBoardItemsState';

export function BoardActionBarButtonDeleteOpportunities() {
  const [selectedBoardItems, setSelectedBoardItems] = useRecoilState(
    selectedBoardItemsState,
  );
  const [items, setItems] = useRecoilState(boardItemsState);

  const [deleteOpportunities] = useDeleteManyPipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  async function handleDeleteClick() {
    await deleteOpportunities({
      variables: {
        ids: selectedBoardItems,
      },
    });

    setItems(
      Object.fromEntries(
        Object.entries(items).filter(
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
