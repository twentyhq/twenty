import { getOperationName } from '@apollo/client/utilities';
import { IconCheckbox, IconNotes, IconTrash } from '@tabler/icons-react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ContextMenuEntry } from '@/ui/context-menu/components/ContextMenuEntry';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { contextMenuEntriesState } from '@/ui/table/states/ContextMenuEntriesState';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import {
  ActivityType,
  CommentableType,
  useDeleteManyPersonMutation,
} from '~/generated/graphql';

import { GET_PEOPLE } from '../queries';

export function useOpenContextMenu() {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

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
    setContextMenuEntries([
      <ContextMenuEntry
        label="Note"
        icon={<IconNotes size={16} />}
        onClick={() => handleActivityClick(ActivityType.Note)}
      />,
      <ContextMenuEntry
        label="Task"
        icon={<IconCheckbox size={16} />}
        onClick={() => handleActivityClick(ActivityType.Task)}
      />,
      <ContextMenuEntry
        label="Delete"
        icon={<IconTrash size={16} />}
        type="danger"
        onClick={handleDeleteClick}
      />,
    ]);
  };
}
