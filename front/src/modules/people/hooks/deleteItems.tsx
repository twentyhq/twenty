import { useRecoilValue } from 'recoil';

import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { Filter } from '@/ui/filter-n-sort/types/Filter';
import { IconTrash } from '@/ui/icon/index';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { TableContext } from '@/ui/table/states/TableContext';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export function useDeleteItems({
  handleDeleteItems,
  id,
}: {
  handleDeleteItems: (val: any) => any;
  id: string;
}) {
  const { enqueueSnackBar } = useSnackBar();
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const resetRowSelection = useResetTableRowSelection();

  const [_, setFilters] = useRecoilScopedState(
    filtersScopedState,
    TableContext,
  );

  function handleCancelClick() {
    // Remove the filter that hides the rows that are being deleted
    setFilters((prevFilters) =>
      prevFilters.filter(({ type }) => type !== '_exclusion_projection'),
    );
  }

  function handleTimeout() {
    const rowIdsToDelete = selectedRowIds;

    resetRowSelection();

    handleDeleteItems({
      variables: {
        ids: rowIdsToDelete,
      },
    });
  }

  function handleDeleteClick() {
    enqueueSnackBar(`${selectedRowIds.length} deleted elements`, {
      duration: 5000,
      icon: <IconTrash />,
      onCancelClick: handleCancelClick,
      onTimeout: handleTimeout,
      id,
    });

    // Hide the rows that are being deleted
    resetRowSelection();
    const deletedElementsFilter: Filter[] = selectedRowIds.map((id) => ({
      field: 'id',
      type: '_exclusion_projection',
      value: id,
      displayValue: id,
      operand: 'is-not',
    }));
    setFilters((prevFilters) => [...prevFilters, ...deletedElementsFilter]);
  }

  return { handleDeleteClick };
}
