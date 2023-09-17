import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { actionBarEntriesState } from '@/ui/action-bar/states/actionBarEntriesState';
import { IconCheckbox, IconNotes, IconTrash } from '@/ui/icon';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { ActivityType, useDeleteManyPersonMutation } from '~/generated/graphql';

import { GET_PEOPLE } from '../graphql/queries/getPeople';

import { useCreateActivityForPeople } from './useCreateActivityForPeople';

export const usePersonTableActionBarEntries = () => {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);
  const createActivityForPeople = useCreateActivityForPeople();

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
      update: (cache) => {
        setTableRowIds(
          tableRowIds.filter((id) => !rowIdsToDelete.includes(id)),
        );
        rowIdsToDelete.forEach((id) => {
          cache.evict({ id: cache.identify({ id, __typename: 'Person' }) });
          cache.gc();
        });
      },
    });
  };

  return {
    setActionBarEntries: () =>
      setActionBarEntries([
        {
          label: 'Note',
          Icon: IconNotes,
          onClick: () => createActivityForPeople(ActivityType.Note),
        },
        {
          label: 'Task',
          Icon: IconCheckbox,
          onClick: () => createActivityForPeople(ActivityType.Task),
        },
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => handleDeleteClick(),
        },
      ]),
  };
};
