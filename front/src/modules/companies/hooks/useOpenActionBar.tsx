import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { GET_PIPELINES } from '@/pipeline/queries';
import { ActionBarEntry } from '@/ui/action-bar/components/ActionBarEntry';
import { IconCheckbox, IconNotes, IconTrash } from '@/ui/icon';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { actionBarEntriesState } from '@/ui/table/states/ActionBarEntriesState';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import {
  ActivityType,
  CommentableType,
  useDeleteManyCompaniesMutation,
} from '~/generated/graphql';

export function useOpenActionBar() {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleActivityClick(type: ActivityType) {
    openCreateActivityRightDrawer(type, CommentableType.Company);
  }

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const resetRowSelection = useResetTableRowSelection();

  const [deleteCompanies] = useDeleteManyCompaniesMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);

  async function handleDeleteClick() {
    const rowIdsToDelete = selectedRowIds;

    resetRowSelection();

    await deleteCompanies({
      variables: {
        ids: rowIdsToDelete,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteManyCompany: {
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
