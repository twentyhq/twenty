import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { ContextMenuEntry } from '@/ui/context-menu/components/ContextMenuEntry';
import { contextMenuEntriesState } from '@/ui/context-menu/states/contextMenuEntriesState';
import { IconCheckbox, IconNotes, IconTrash } from '@/ui/icon';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { ActivityType, useDeleteManyPersonMutation } from '~/generated/graphql';

import { GET_PEOPLE } from '../graphql/queries/getPeople';

export const usePersonTableContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  const handleActivityClick = async (type: ActivityType) => {
    openCreateActivityRightDrawer(type, ActivityTargetableEntityType.Person);
  };

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);

  const resetRowSelection = useResetTableRowSelection();

  const [deleteManyPerson] = useDeleteManyPersonMutation({
    refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
  });

  const handleDeleteClick = async () => {
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
  };

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        <ContextMenuEntry
          label="Note"
          Icon={IconNotes}
          onClick={() => handleActivityClick(ActivityType.Note)}
          key="note"
        />,
        <ContextMenuEntry
          label="Task"
          Icon={IconCheckbox}
          onClick={() => handleActivityClick(ActivityType.Task)}
          key="task"
        />,
        <ContextMenuEntry
          label="Delete"
          Icon={IconTrash}
          accent="danger"
          onClick={handleDeleteClick}
          key="delete"
        />,
      ]),
  };
};
