import { useFavorites } from '@/favorites/hooks/useFavorites';
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

  const { resetTableRowSelection, hasUserSelectedAllRowsState } =
    useRecordTable({
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
  const { favorites, deleteFavorite } = useFavorites();

  const hasUserSelectedAllRows = useRecoilValue(hasUserSelectedAllRowsState);

  const deleteRecords = async (recordIdsToDelete: string[]) => {
    if (hasUserSelectedAllRows) {
      const allRecordIds = await fetchAllRecordIds();

      const unselectedRecordIds = tableRowIds.filter(
        (recordId) => !recordIdsToDelete.includes(recordId),
      );

      recordIdsToDelete = allRecordIds.filter(
        (recordId) => !unselectedRecordIds.includes(recordId),
      );
    }

    resetTableRowSelection();

    for (const recordIdToDelete of recordIdsToDelete) {
      const foundFavorite = favorites?.find(
        (favorite) => favorite.recordId === recordIdToDelete,
      );

      if (foundFavorite !== undefined) {
        deleteFavorite(foundFavorite.id);
      }
    }

    await deleteManyRecords(recordIdsToDelete, {
      delayInMsBetweenRequests: 50,
    });
  };

  return { deleteTableData: deleteRecords };
};
