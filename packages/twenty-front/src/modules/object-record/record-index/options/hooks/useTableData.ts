import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

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
  ) => void;
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
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);

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
      onCompleted: (_data, options) => {
        setHasNextPage(options?.pageInfo?.hasNextPage ?? false);
      },
    });

  useEffect(() => {
    const MAXIMUM_REQUESTS = Math.min(maximumRequests, totalCount / pageSize);

    const fetchNextPage = async () => {
      setInflight(true);
      await fetchMoreRecords();
      setPageCount((state) => state + 1);
      setProgress(percentage(pageCount, MAXIMUM_REQUESTS));
      await sleep(delayMs);
      setInflight(false);
    };

    if (!isDownloading || inflight) {
      return;
    }

    if (!loading) {
      if (!hasNextPage || pageCount >= MAXIMUM_REQUESTS) {
        callback(records, columns);
        setIsDownloading(false);
        setProgress(undefined);
      } else {
        fetchNextPage();
      }
    }
  }, [
    delayMs,
    fetchMoreRecords,
    hasNextPage,
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
  ]);

  return {
    progress,
    download: () => {
      setPageCount(0);
      setIsDownloading(true);
      findManyRecords?.();
    },
  };
};
