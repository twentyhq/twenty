import { MutableRefObject } from 'react';
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
  timerRef,
}: {
  handleDeleteItems: (val: any) => any;
  timerRef: MutableRefObject<NodeJS.Timeout | null>;
}) {
  const { enqueueSnackBar } = useSnackBar();
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  const duration = 5000;

  const resetRowSelection = useResetTableRowSelection();

  const [_, setFilters] = useRecoilScopedState(
    filtersScopedState,
    TableContext,
  );

  function handleCloseSnackbar() {
    // Cancel the timeout which will prevent the delete from occurring
    if (timerRef.current) clearTimeout(timerRef.current);
    // Remove the filter that hides the rows that are being deleted
    setFilters((prevFilters) =>
      prevFilters.filter(({ type }) => type !== '_exclusion_projection'),
    );
  }

  function handleDeleteClick() {
    enqueueSnackBar(`${selectedRowIds.length} deleted elements`, {
      duration,
      onClose: handleCloseSnackbar,
      cancelText: 'Cancel',
      icon: <IconTrash />,
    });

    timerRef.current = setTimeout(() => {
      const rowIdsToDelete = selectedRowIds;

      resetRowSelection();

      handleDeleteItems({
        variables: {
          ids: rowIdsToDelete,
        },
      });
      // Ensure to complete the deletion of the rows before the
      // snackbar is closed, otherwise it will be cancelled
    }, duration - 100);

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
