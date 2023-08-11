import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActionBarEntry } from '@/ui/action-bar/components/ActionBarEntry';
import { IconCheckbox, IconNotes, IconTrash } from '@/ui/icon';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { actionBarEntriesState } from '@/ui/table/states/ActionBarEntriesState';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import {
  ActivityType,
  CommentableType,
  useDeleteManyPersonMutation,
} from '~/generated/graphql';

import { GET_PEOPLE } from '../queries';

export function useOpenActionBar() {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleActivityClick(type: ActivityType) {
    openCreateActivityRightDrawer(type, CommentableType.Person);
  }

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

  return () => {
    setActionBarEntries([
      <ActionBarEntry
        label="Note"
        icon={<IconNotes size={16} />}
        onClick={() => handleActivityClick(ActivityType.Note)}
      />,
      <ActionBarEntry
        label="Task"
        icon={<IconCheckbox size={16} />}
        onClick={() => handleActivityClick(ActivityType.Task)}
      />,
      <ActionBarEntry
        label="Delete"
        icon={<IconTrash size={16} />}
        type="danger"
        onClick={handleDeleteClick}
      />,
    ]);
  };
}
