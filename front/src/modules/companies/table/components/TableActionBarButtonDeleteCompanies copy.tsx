import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';

import { GET_PIPELINES } from '@/pipeline/queries';
import { IconTrash } from '@/ui/icon/index';
import { EntityTableContextMenuEntry } from '@/ui/table/context-menu/components/EntityTableContextMenuEntry';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { useDeleteManyCompaniesMutation } from '~/generated/graphql';

export function TableContextMenuEntryDeleteCompanies() {
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

  return (
    <EntityTableContextMenuEntry
      label="Delete"
      icon={<IconTrash size={16} />}
      type="warning"
      onClick={handleDeleteClick}
    />
  );
}
