import { useCallback } from 'react';

import { EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE } from '@/object-record/object-options-dropdown/constants/ExportTableDataDefaultPageSize';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  useRecordIndexLazyFetchRecords,
  type UseRecordDataOptions,
} from '@/object-record/record-index/export/hooks/useRecordIndexLazyFetchRecords';
import { csvDownloader } from '@/object-record/record-index/export/utils/csvDownloader';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type ExportProgress = {
  exportedRecordCount?: number;
  totalRecordCount?: number;
  displayType: 'percentage' | 'number';
};

const percentage = (part: number, whole: number): number => {
  return Math.round((part / whole) * 100);
};

export const displayedExportProgress = (progress?: ExportProgress): string => {
  if (isUndefinedOrNull(progress?.exportedRecordCount)) {
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
  const downloadCsv = useCallback(
    (
      records: ObjectRecord[],
      columns: Pick<
        ColumnDefinition<FieldMetadata>,
        'label' | 'type' | 'metadata'
      >[],
    ) => {
      csvDownloader(filename, { rows: records, columns });
    },
    [filename],
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
