import { MutableRefObject } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { GET_PEOPLE } from '@/people/queries';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { Filter } from '@/ui/filter-n-sort/types/Filter';
import { IconTrash } from '@/ui/icon/index';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { TableContext } from '@/ui/table/states/TableContext';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useDeleteManyPersonMutation } from '~/generated/graphql';

export function TableActionBarButtonDeletePeople({
  timerRef,
}: {
  timerRef: MutableRefObject<NodeJS.Timeout | null>;
}) {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  const { enqueueSnackBar } = useSnackBar();
  const duration = 5000;

  const resetRowSelection = useResetTableRowSelection();

  const [deleteManyPerson] = useDeleteManyPersonMutation({
    refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
  });

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

  async function handleDeleteClick() {
    enqueueSnackBar(`${selectedRowIds.length} deleted elements`, {
      icon: <IconTrash />,
      duration,
      onClose: handleCloseSnackbar,
      cancelText: 'Cancel',
    });

    timerRef.current = setTimeout(() => {
      const rowIdsToDelete = selectedRowIds;

      resetRowSelection();

      deleteManyPerson({
        variables: {
          ids: rowIdsToDelete,
        },
      });
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

  return (
    <EntityTableActionBarButton
      label="Delete"
      icon={<IconTrash size={16} />}
      type="warning"
      onClick={handleDeleteClick}
    />
  );
}
