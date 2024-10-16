import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordsFiltersState } from '@/context-store/states/contextStoreTargetedRecordsFilters';
import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { turnFiltersIntoQueryFilter } from '@/object-record/record-filter/utils/turnFiltersIntoQueryFilter';
import { EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE } from '@/object-record/record-index/options/constants/ExportTableDataDefaultPageSize';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { ViewType } from '@/views/types/ViewType';

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

export const useRecordData = ({
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

  const { visibleTableColumnsSelector } = useRecordTableStates(recordIndexId);

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

  const contextStoreTargetedRecords = useRecoilValue(
    contextStoreTargetedRecordsState,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const contextStoreTargetedRecordsFilters = useRecoilValue(
    contextStoreTargetedRecordsFiltersState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });
  const queryFilter = turnFiltersIntoQueryFilter(
    contextStoreTargetedRecordsFilters,
    objectMetadataItem?.fields ?? [],
  );

  const selectedRecordIds = contextStoreTargetedRecords.selectedRecordIds;
  const excludedRecordIds = contextStoreTargetedRecords.excludedRecordIds;

  const {
    findManyRecords,
    totalCount,
    records,
    fetchMoreRecordsWithPagination,
    loading,
  } = useLazyFindManyRecords({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    recordGqlFields: objectMetadataItem
      ? generateDepthOneRecordGqlFields({ objectMetadataItem })
      : undefined,
    filter: makeAndFilterVariables([
      queryFilter,
      selectedRecordIds !== 'all'
        ? selectedRecordIds.length === 0
          ? undefined
          : {
              id: {
                in: selectedRecordIds,
              },
            }
        : excludedRecordIds.length > 0
          ? {
              not: {
                id: {
                  in: excludedRecordIds,
                },
              },
            }
          : undefined,
    ]),
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
