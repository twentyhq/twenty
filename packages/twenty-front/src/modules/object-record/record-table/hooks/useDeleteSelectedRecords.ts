import { useCallback } from 'react';

import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const useDeleteSelectedRecords = () => {
  const { objectNameSingular, objectPermissions } =
    useRecordTableContextOrThrow();

  const selectedRowIds = useAtomComponentSelectorValue(
    selectedRowIdsComponentSelector,
  );

  const { resetTableRowSelection } = useResetTableRowSelection();

  const { deleteManyRecords } = useDeleteManyRecords({ objectNameSingular });

  const deleteSelectedRecords = useCallback(async () => {
    if (objectPermissions.canSoftDeleteObjectRecords !== true) {
      return;
    }

    if (selectedRowIds.length === 0) {
      return;
    }

    resetTableRowSelection();

    await deleteManyRecords({ recordIdsToDelete: selectedRowIds });
  }, [
    objectPermissions,
    selectedRowIds,
    resetTableRowSelection,
    deleteManyRecords,
  ]);

  return { deleteSelectedRecords };
};
