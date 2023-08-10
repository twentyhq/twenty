import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';

import { GET_PEOPLE } from '@/people/queries';
import { IconTrash } from '@/ui/icon/index';
import { EntityTableContextMenuEntry } from '@/ui/table/context-menu/components/EntityTableContextMenuEntry';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { useDeleteManyPersonMutation } from '~/generated/graphql';

export function TableContextMenuEntryDeletePeople() {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);

  const resetRowSelection = useResetTableRowSelection();

  const [deleteManyPerson] = useDeleteManyPersonMutation({
    refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
  });

  async function handleDeleteClick() {
    const rowIdsToDelete = selectedRowIds;

    resetRowSelection();

    await deleteManyPerson({
      variables: {
        ids: rowIdsToDelete,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteManyPerson: {
          count: rowIdsToDelete.length,
        },
      },
      update: () => {
        setTableRowIds(
          tableRowIds.filter((id) => !rowIdsToDelete.includes(id)),
        );
      },
    });
  }

  return (
    <EntityTableContextMenuEntry
      label="Delete"
      icon={<IconTrash size={16} />}
      type="warning"
      onClick={handleDeleteClick}
    />
  );
}
