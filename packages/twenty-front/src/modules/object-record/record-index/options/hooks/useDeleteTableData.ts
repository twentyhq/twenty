import { useCallback } from 'react';

import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useLazyFetchAllRecordIds } from '@/object-record/hooks/useLazyFetchAllRecordIds';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { UseTableDataOptions } from '@/object-record/record-index/options/hooks/useTableData';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseDeleteTableDataOptions = Omit<UseTableDataOptions, 'callback'>;

export const useDeleteTableData = ({
  delayMs,
  maximumRequests = 100,
  objectNameSingular,
  pageSize = 30,
  recordIndexId,
}: UseDeleteTableDataOptions) => {
  const { fetchAllRecordIds, fetchProgress } = useLazyFetchAllRecordIds({
    objectNameSingular,
  });

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const { deleteManyRecords } = useDeleteManyRecords({ objectNameSingular });

  const deleteRecords = useCallback(
    async (
      rows: ObjectRecord[],
      _columns: ColumnDefinition<FieldMetadata>[],
    ) => {
      const recordIds = rows.map((record) => record.id);

      await deleteManyRecords(recordIds);
      resetTableRowSelection();
    },
    [deleteManyRecords, resetTableRowSelection],
  );

  // const { getTableData: deleteTableData } = useTableData({
  //   delayMs,
  //   maximumRequests,
  //   objectNameSingular,
  //   pageSize,
  //   recordIndexId,
  //   callback: deleteRecords,
  // });

  const deleteProgress = fetchProgress / 2;

  return { deleteTableData: fetchAllRecordIds, deleteProgress };
};
