import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { UseTableDataOptions } from '@/object-record/record-index/options/hooks/useTableData';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';

type UseDeleteTableDataOptions = Pick<
  UseTableDataOptions,
  'objectNameSingular' | 'recordIndexId'
>;

export const useDeleteTableData = ({
  objectNameSingular,
  recordIndexId,
}: UseDeleteTableDataOptions) => {
  const { resetTableRowSelection } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular,
  });
  const { favorites, deleteFavorite } = useFavorites();

  const deleteRecords = async (recordIdsToDelete: string[]) => {
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
