import { useRecoilValue } from 'recoil';

import { EntityTableActionBarButton } from '@/ui/components/table/action-bar/EntityTableActionBarButton';
import { IconTrash } from '@/ui/icons/index';
import { useResetTableRowSelection } from '@/ui/tables/hooks/useResetTableRowSelection';
import { selectedRowIdsState } from '@/ui/tables/states/selectedRowIdsState';
import { useDeletePeopleMutation } from '~/generated/graphql';

export function TableActionBarButtonDeletePeople() {
  const selectedRowIds = useRecoilValue(selectedRowIdsState);

  const resetRowSelection = useResetTableRowSelection();

  const [deletePeople] = useDeletePeopleMutation({
    refetchQueries: ['GetPeople'],
  });

  async function handleDeleteClick() {
    await deletePeople({
      variables: {
        ids: selectedRowIds,
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
