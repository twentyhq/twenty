import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useFetchAllRecordIds } from '@/object-record/hooks/useFetchAllRecordIds';
import { UseTableDataOptions } from '@/object-record/record-index/options/hooks/useTableData';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { useRecoilValue } from 'recoil';

type UseDeleteTableDataOptions = Omit<UseTableDataOptions, 'callback'>;

export const useDeleteTableData = ({
  objectNameSingular,
  recordIndexId,
}: UseDeleteTableDataOptions) => {
  const { fetchAllRecordIds } = useFetchAllRecordIds({
    objectNameSingular,
  });

  const {
    resetTableRowSelection,
    selectedRowIdsSelector,
    hasUserSelectedAllRowState,
  } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const tableRowIds = useRecoilValue(
    tableRowIdsComponentState({
      scopeId: getScopeIdFromComponentId(recordIndexId),
    }),
  );

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular,
  });

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  const hasUserSelectedAllRow = useRecoilValue(hasUserSelectedAllRowState);

  const deleteRecords = async () => {
    let recordIdsToDelete = selectedRowIds;

    if (hasUserSelectedAllRow) {
      const allRecordIds = await fetchAllRecordIds();

      const unselectedRecordIds = tableRowIds.filter(
        (recordId) => !selectedRowIds.includes(recordId),
      );

      recordIdsToDelete = allRecordIds.filter(
        (recordId) => !unselectedRecordIds.includes(recordId),
      );

      console.log({
        unselectedRecordIds,
        recordIdsToDelete,
      });
    }

    console.log({ recordIdsToDelete });

    await deleteManyRecords(recordIdsToDelete, {
      delayInMsBetweenRequests: 25,
    });

    resetTableRowSelection();
  };

  return { deleteTableData: deleteRecords };
};
