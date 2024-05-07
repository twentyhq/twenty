import { useMemo } from 'react';

import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import {
  useTableData,
  UseTableDataOptions,
} from '@/object-record/record-index/options/hooks/useTableData';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseDeleteTableDataOptions = Omit<UseTableDataOptions, 'callback'> & {
  callback?: () => void;
};

export const useDeleteTableData = ({
  delayMs,
  maximumRequests = 100,
  objectNameSingular,
  pageSize = 30,
  recordIndexId,
  callback,
}: UseDeleteTableDataOptions) => {
  const { deleteManyRecords } = useDeleteManyRecords({ objectNameSingular });

  const deleteRecords = useMemo(
    () =>
      (rows: ObjectRecord[], _columns: ColumnDefinition<FieldMetadata>[]) => {
        const recordIds = rows.map((record) => record.id);
        deleteManyRecords(recordIds);
        callback?.();
      },
    [callback, deleteManyRecords],
  );

  const { progress, download: deleteTableData } = useTableData({
    delayMs,
    maximumRequests,
    objectNameSingular,
    pageSize,
    recordIndexId,
    callback: deleteRecords,
  });

  return {
    progress,
    deleteTableData,
  };
};
