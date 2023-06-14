import { useRecoilValue } from 'recoil';

import { EntityTableActionBarButton } from '@/ui/components/table/action-bar/EntityTableActionBarButton';
import { IconTrash } from '@/ui/icons/index';
import { useResetTableRowSelection } from '@/ui/tables/hooks/useResetTableRowSelection';
import { selectedRowIdsState } from '@/ui/tables/states/selectedRowIdsState';
import { useDeleteCompaniesMutation } from '~/generated/graphql';

export function TableActionBarButtonDeleteCompanies() {
  const selectedRowIds = useRecoilValue(selectedRowIdsState);

  const resetRowSelection = useResetTableRowSelection();

  const [deleteCompanies] = useDeleteCompaniesMutation({
    refetchQueries: ['GetCompanies'],
  });

  async function handleDeleteClick() {
    await deleteCompanies({
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
