import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { GET_PIPELINES } from '@/opportunities/queries';
import { EntityTableActionBarButton } from '@/ui/components/table/action-bar/EntityTableActionBarButton';
import { IconTrash } from '@/ui/icons/index';
import { useResetTableRowSelection } from '@/ui/tables/hooks/useResetTableRowSelection';

// import { useDeletePipelineProgressesMutation } from '~/generated/graphql';
import { selectedBoardItemsState } from '../states/selectedBoardItemsState';

export function BoardActionBarButtonDeleteOpportunities() {
  const selectedBoardItems = useRecoilValue(selectedBoardItemsState);

  const resetRowSelection = useResetTableRowSelection();

  const [deleteOpportunities] = [
    async (_: any) => {
      console.log('deleteOpportunities');
    },
  ];

  async function handleDeleteClick() {
    await deleteOpportunities({
      variables: {
        ids: selectedBoardItems,
      },
    });

    resetRowSelection();
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
