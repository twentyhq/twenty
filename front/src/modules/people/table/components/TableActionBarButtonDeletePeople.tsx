import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { GET_PEOPLE } from '@/people/queries';
import { IconTrash } from '@/ui/icon/index';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { useDeletePeopleMutation } from '~/generated/graphql';

export function TableActionBarButtonDeletePeople() {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const resetRowSelection = useResetTableRowSelection();

  const [deletePeople] = useDeletePeopleMutation({
    refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
  });

  async function handleDeleteClick() {
    const rowIdsToDelete = selectedRowIds;

    resetRowSelection();

    await deletePeople({
      variables: {
        ids: rowIdsToDelete,
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
