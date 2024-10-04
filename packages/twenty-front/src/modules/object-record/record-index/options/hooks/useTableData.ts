import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE } from '@/object-record/record-index/options/constants/ExportTableDataDefaultPageSize';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { ViewType } from '@/views/types/ViewType';
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
  viewType?: ViewType;
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
  pageSize = EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE,
  recordIndexId,
  callback,
  viewType = ViewType.Table,
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
    hasUserSelectedAllRowsState,
  } = useRecordTableStates(recordIndexId);

  const { hiddenBoardFields } = useRecordIndexOptionsForBoard({
    objectNameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const { kanbanFieldMetadataNameState } = useRecordBoardStates(recordIndexId);
  const kanbanFieldMetadataName = useRecoilValue(kanbanFieldMetadataNameState);
  const hiddenKanbanFieldColumn = hiddenBoardFields.find(
    (column) => column.metadata.fieldName === kanbanFieldMetadataName,
  );
  const columns = useRecoilValue(visibleTableColumnsSelector());
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  const hasUserSelectedAllRows = useRecoilValue(hasUserSelectedAllRowsState);
  const tableRowIds = useRecoilValue(tableRowIdsState);

  // user has checked select all and then unselected some rows
  const userHasUnselectedSomeRows =
    hasUserSelectedAllRows && selectedRowIds.length < tableRowIds.length;

  const hasSelectedRows =
    selectedRowIds.length > 0 &&
    !(hasUserSelectedAllRows && selectedRowIds.length === tableRowIds.length);

  const unselectedRowIds = useMemo(
    () =>
      userHasUnselectedSomeRows
        ? tableRowIds.filter((id) => !selectedRowIds.includes(id))
        : [],
    [userHasUnselectedSomeRows, tableRowIds, selectedRowIds],
  );

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

  const unselectedFindManyParams = {
    ...findManyRecordsParams,
    filter: {
      ...findManyRecordsParams.filter,
      not: {
        id: {
          in: unselectedRowIds,
        },
      },
    },
  };

  const usedFindManyParams =
    hasSelectedRows && !userHasUnselectedSomeRows
      ? selectedFindManyParams
      : userHasUnselectedSomeRows
        ? unselectedFindManyParams
        : findManyRecordsParams;

  const {
    findManyRecords,
    totalCount,
    records,
    fetchMoreRecordsWithPagination,
    loading,
  } = useLazyFindManyRecords({
    ...usedFindManyParams,
    limit: pageSize,
  });

  useEffect(() => {
    const fetchNextPage = async () => {
      setInflight(true);
      setPreviousRecordCount(records.length);

      await fetchMoreRecordsWithPagination();

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
      pageCount >= maximumRequests ||
      (isDefined(totalCount) && records.length >= totalCount)
    ) {
      setPageCount(0);

      const complete = () => {
        setPageCount(0);
        setPreviousRecordCount(0);
        setIsDownloading(false);
        setProgress({
          displayType: 'number',
        });
      };

      const finalColumns = [
        ...columns,
        ...(hiddenKanbanFieldColumn && viewType === ViewType.Kanban
          ? [hiddenKanbanFieldColumn]
          : []),
      ];

      const res = callback(records, finalColumns);

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
    fetchMoreRecordsWithPagination,
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
    hiddenKanbanFieldColumn,
    viewType,
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
