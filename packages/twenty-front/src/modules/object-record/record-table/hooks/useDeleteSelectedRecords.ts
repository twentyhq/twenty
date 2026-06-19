import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';

export const useDeleteSelectedRecords = () => {
  const { objectNameSingular, objectPermissions } =
    useRecordTableContextOrThrow();

  const selectedRowIdsCallbackState = useAtomComponentSelectorCallbackState(
    selectedRowIdsComponentSelector,
  );

  const { resetTableRowSelection } = useResetTableRowSelection();

  const { deleteManyRecords } = useDeleteManyRecords({ objectNameSingular });

  const store = useStore();

  const deleteSelectedRecords = useCallback(async () => {
    if (!objectPermissions.canSoftDeleteObjectRecords) {
      return;
    }

    const selectedRowIds = store.get(selectedRowIdsCallbackState);

    if (!isNonEmptyArray(selectedRowIds)) {
      return;
    }

    resetTableRowSelection();

    await deleteManyRecords({ recordIdsToDelete: selectedRowIds });
  }, [
    objectPermissions,
    selectedRowIdsCallbackState,
    resetTableRowSelection,
    deleteManyRecords,
    store,
  ]);

  return { deleteSelectedRecords };
};
