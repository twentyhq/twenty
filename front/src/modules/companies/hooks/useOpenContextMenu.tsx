import { getOperationName } from '@apollo/client/utilities';
import { IconCheckbox, IconNotes, IconTrash } from '@tabler/icons-react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { GET_PIPELINES } from '@/pipeline/queries';
import { ContextMenuEntry } from '@/ui/context-menu/components/ContextMenuEntry';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { contextMenuEntriesState } from '@/ui/table/states/ContextMenuEntriesState';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import {
  ActivityType,
  CommentableType,
  useDeleteManyCompaniesMutation,
} from '~/generated/graphql';

export function useOpenContextMenu() {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick(type: ActivityType) {
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
    setContextMenuEntries([
      <ContextMenuEntry
        label="Note"
        icon={<IconNotes size={16} />}
        onClick={() => handleButtonClick(ActivityType.Note)}
      />,
      <ContextMenuEntry
        label="Task"
        icon={<IconCheckbox size={16} />}
        onClick={() => handleButtonClick(ActivityType.Task)}
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
