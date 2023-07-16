import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { GET_COMPANIES } from '@/companies/queries';
import { EntityTableActionBarButton } from '@/ui/components/table/action-bar/EntityTableActionBarButton';
import { IconTrash } from '@/ui/icons/index';
import { useResetTableRowSelection } from '@/ui/tables/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/tables/states/selectedRowIdsSelector';
import { useDeleteCompaniesMutation } from '~/generated/graphql';

export function TableActionBarButtonDeleteCompanies() {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const resetRowSelection = useResetTableRowSelection();

  const [deleteCompanies] = useDeleteCompaniesMutation({
    refetchQueries: [getOperationName(GET_COMPANIES) ?? ''],
  });

  async function handleDeleteClick() {
    const rowIdsToDelete = selectedRowIds;

    resetRowSelection();

    await deleteCompanies({
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
