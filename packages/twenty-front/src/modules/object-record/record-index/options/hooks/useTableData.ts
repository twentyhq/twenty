import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

import { useFindManyParams } from '../../hooks/useLoadRecordIndexTable';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const percentage = (part: number, whole: number): number => {
  return Math.round((part / whole) * 100);
};

export type UseTableDataOptions = {
  delayMs: number;
  maximumRequests?: number;
  objectNameSingular: string;
  pageSize?: number;
  recordIndexId: string;
  callback: (
    rows: ObjectRecord[],
    columns: ColumnDefinition<FieldMetadata>[],
  ) => void | Promise<void>;
};

type ExportProgress = {
  exportedRecordCount?: number;
  totalRecordCount?: number;
  displayType: 'percentage' | 'number';
};

export const useTableData = ({
  delayMs,
  maximumRequests = 100,
  objectNameSingular,
  pageSize = 30,
  recordIndexId,
  callback,
}: UseTableDataOptions) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [inflight, setInflight] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [progress, setProgress] = useState<ExportProgress>({
    displayType: 'number',
  });
  const [previousRecordCount, setPreviousRecordCount] = useState(0);

  const {
    visibleTableColumnsSelector,
    selectedRowIdsSelector,
    tableRowIdsState,
    hasUserSelectedAllRowState,
  } = useRecordTableStates(recordIndexId);

  const columns = useRecoilValue(visibleTableColumnsSelector());
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  const hasUserSelectedAllRow = useRecoilValue(hasUserSelectedAllRowState);
  const tableRowIds = useRecoilValue(tableRowIdsState);

  const hasSelectedRows =
    selectedRowIds.length > 0 &&
    !(hasUserSelectedAllRow && selectedRowIds.length === tableRowIds.length);

  const findManyRecordsParams = useFindManyParams(
    objectNameSingular,
    recordIndexId,
  );

  const selectedFindManyParams = {
    ...findManyRecordsParams,
    filter: {
      ...findManyRecordsParams.filter,
      id: {
        in: selectedRowIds,
      },
    },
  };

  const usedFindManyParams = hasSelectedRows
    ? selectedFindManyParams
    : findManyRecordsParams;

  const { findManyRecords, totalCount, records, fetchMoreRecords, loading } =
    useLazyFindManyRecords({
      ...usedFindManyParams,
      limit: pageSize,
    });

  useEffect(() => {
    const MAXIMUM_REQUESTS = isDefined(totalCount)
      ? Math.min(maximumRequests, totalCount / pageSize)
      : maximumRequests;

    const fetchNextPage = async () => {
      setInflight(true);
      setPreviousRecordCount(records.length);
      await fetchMoreRecords();
      setPageCount((state) => state + 1);
      setProgress({
        exportedRecordCount: records.length,
        totalRecordCount: totalCount,
        displayType: totalCount ? 'percentage' : 'number',
      });
      await sleep(delayMs);
      setInflight(false);
    };

    if (!isDownloading || inflight || loading) {
      return;
    }

    if (
      pageCount >= MAXIMUM_REQUESTS ||
      (isDefined(totalCount) && records.length === totalCount)
    ) {
      setPageCount(0);

      const complete = () => {
        setIsDownloading(false);
        setProgress({
          displayType: 'number',
        });
      };

      const res = callback(records, columns);

      if (res instanceof Promise) {
        res.then(complete);
      } else {
        complete();
      }
    } else {
      fetchNextPage();
    }
  }, [
    delayMs,
    fetchMoreRecords,
    inflight,
    isDownloading,
    pageCount,
    records,
    totalCount,
    columns,
    maximumRequests,
    pageSize,
    loading,
    callback,
    previousRecordCount,
  ]);

  return {
    progress,
    isDownloading,
    getTableData: () => {
      setPageCount(0);
      setPreviousRecordCount(0);
      setIsDownloading(true);
      findManyRecords?.();
    },
  };
};
