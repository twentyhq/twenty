import { TbTrash } from 'react-icons/tb';
import { EntityTableActionBarButton } from '../../../components/table/action-bar/EntityTableActionBarButton';
import { useDeleteCompaniesMutation } from '../../../generated/graphql';
import { selectedRowIdsState } from '../../../modules/ui/tables/states/selectedRowIdsState';
import { useRecoilValue } from 'recoil';
import { useResetTableRowSelection } from '../../../modules/ui/tables/hooks/useResetTableRowSelection';

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
      icon={<TbTrash size={16} />}
      color="red"
      onClick={handleDeleteClick}
    />
  );
}
