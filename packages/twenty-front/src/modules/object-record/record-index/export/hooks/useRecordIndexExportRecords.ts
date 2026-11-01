import { useCallback } from 'react';

import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { useStore } from 'jotai';
import { EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE } from '@/object-record/object-options-dropdown/constants/ExportTableDataDefaultPageSize';
import {
  useRecordIndexLazyFetchRecords,
  type UseRecordDataOptions,
} from '@/object-record/record-index/export/hooks/useRecordIndexLazyFetchRecords';
import { csvDownloader } from '@/object-record/record-index/export/utils/csvDownloader';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type ExportProgress = {
  exportedRecordCount?: number;
  totalRecordCount?: number;
  displayType: 'percentage' | 'number';
};

const percentage = (part: number, whole: number): number => {
  return Math.round((part / whole) * 100);
};

export const displayedExportProgress = (progress?: ExportProgress): string => {
  if (!isDefined(progress?.exportedRecordCount)) {
    return t`Export`;
  }

  if (
    progress.displayType === 'percentage' &&
    isDefined(progress?.totalRecordCount)
  ) {
    const percentageValue = percentage(
      progress.exportedRecordCount,
      progress.totalRecordCount,
    );
    return t`Export (${percentageValue}%)`;
  }

  const exportedCount = progress.exportedRecordCount;
  return t`Export (${exportedCount})`;
};

type UseExportTableDataOptions = Omit<UseRecordDataOptions, 'callback'> & {
  filename: string;
};

export const useRecordIndexExportRecords = ({
  delayMs,
  filename,
  maximumRequests = 1000,
  objectMetadataItem,
  pageSize = EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE,
  recordIndexId,
  viewType,
  onMoreRecords,
  abortSignal,
}: UseExportTableDataOptions) => {
  const store = useStore();

  const downloadCsv = useCallback<UseRecordDataOptions['callback']>(
    ({ rows, columns }) => {
      const objectMetadataItems = store.get(
        objectMetadataItemsWithFieldsSelector.atom,
      );
      csvDownloader({ filename, rows, columns, objectMetadataItems });
    },
    [filename, store],
  );

  const { getTableData: download, progress } = useRecordIndexLazyFetchRecords({
    delayMs,
    maximumRequests,
    objectMetadataItem,
    pageSize,
    recordIndexId,
    callback: downloadCsv,
    viewType,
    onMoreRecords,
    abortSignal,
  });

  return { progress, download };
};
