import { type RecordIndexExportColumn } from '@/object-record/record-index/export/types/RecordIndexExportColumn';
import { json2csv } from 'json-2-csv';
import { useMemo } from 'react';

import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE } from '@/object-record/object-options-dropdown/constants/ExportTableDataDefaultPageSize';
import { useExportProcessRecordsForCSV } from '@/object-record/object-options-dropdown/hooks/useExportProcessRecordsForCSV';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  useRecordIndexLazyFetchRecords,
  type UseRecordDataOptions,
} from '@/object-record/record-index/export/hooks/useRecordIndexLazyFetchRecords';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { t } from '@lingui/core/macro';
import { saveAs } from 'file-saver';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from 'twenty-shared/constants';
import {
  formatValueForCSV,
  isDefined,
  isPlainObject,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type GenerateExportOptions = {
  columns: RecordIndexExportColumn[];
  rows: Record<string, any>[];
};

type GenerateExport = (data: GenerateExportOptions) => string;

type ExportProgress = {
  exportedRecordCount?: number;
  totalRecordCount?: number;
  displayType: 'percentage' | 'number';
};

const getValueAtPath = (row: Record<string, any>, path: string): unknown =>
  path.split('.').reduce<unknown>(
    (value, key) => (isPlainObject(value) ? value[key] : undefined),
    row,
  );

const sanitizeExportValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return sanitizeValueForCSVExport(value);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([nestedKey, nestedValue]) => [
        nestedKey,
        sanitizeExportValue(nestedValue),
      ]),
    );
  }

  return value;
};

export const generateCsv: GenerateExport = ({
  columns,
  rows,
}: GenerateExportOptions): string => {
  const columnsToExport = columns.filter(
    (col) =>
      !('relationType' in col.metadata && col.metadata.relationType) ||
      col.metadata.relationType === RelationType.MANY_TO_ONE,
  );

  const objectIdColumn: ColumnDefinition<FieldMetadata> = {
    fieldMetadataId: '',
    type: FieldMetadataType.UUID,
    iconName: '',
    label: `Id`,
    metadata: {
      fieldName: 'id',
    },
    position: 0,
    size: 0,
  };

  const columnsToExportWithIdColumn = [objectIdColumn, ...columnsToExport];

  const keys = columnsToExportWithIdColumn.flatMap((col) => {
    const headerLabel = `${col.label}${col.type === 'RELATION' ? ' Id' : ''}`;
    // A column through a relation reads its value from the nested related record.
    const fieldPathPrefix = isDefined(col.relationTraversal)
      ? `${col.relationTraversal.relationFieldName}.`
      : '';
    const column = {
      field: `${fieldPathPrefix}${col.metadata.fieldName}${col.type === 'RELATION' ? 'Id' : ''}`,
      title: formatValueForCSV(sanitizeValueForCSVExport(headerLabel)),
    };

    const columnType = col.type;
    if (!isCompositeFieldType(columnType)) return [column];

    const firstCompositeValue = rows
      .map((row) => getValueAtPath(row, column.field))
      .find(isPlainObject);

    const compositeSubFieldKeys = isDefined(firstCompositeValue)
      ? Object.keys(firstCompositeValue)
      : Object.keys(COMPOSITE_FIELD_SUB_FIELD_LABELS[columnType]);

    const nestedFieldsWithoutTypename = compositeSubFieldKeys
      .filter((key) => key !== '__typename')
      .map((key) => {
        const subFieldLabel = COMPOSITE_FIELD_SUB_FIELD_LABELS[columnType][key];
        return {
          field: `${column.field}.${key}`,
          title: formatValueForCSV(
            sanitizeValueForCSVExport(`${column.title} / ${subFieldLabel}`),
          ),
        };
      });

    return nestedFieldsWithoutTypename;
  });

  const sanitizedRows = rows.map((row) => {
    const sanitizedRow: Record<string, any> = {};

    for (const [key, value] of Object.entries(row)) {
      sanitizedRow[key] = sanitizeExportValue(value);
    }

    return sanitizedRow;
  });

  return json2csv(sanitizedRows, {
    keys,
    emptyFieldValue: '',
    excelBOM: true,
    // Note: We handle CSV injection prevention manually with ZWJ approach above
    // This preserves original which the csvSecurity option does not do
  });
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

const downloader = (mimeType: string, generator: GenerateExport) => {
  return (filename: string, data: GenerateExportOptions) => {
    const blob = new Blob([generator(data)], { type: mimeType });
    saveAs(blob, filename);
  };
};

export const csvDownloader = downloader('text/csv', generateCsv);

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
}: UseExportTableDataOptions) => {
  const { processRecordsForCSVExport } = useExportProcessRecordsForCSV(
    objectMetadataItem.nameSingular,
  );

  const downloadCsv = useMemo(
    () =>
      (
        records: ObjectRecord[],
        columns: RecordIndexExportColumn[],
      ) => {
        const recordsProcessedForExport = processRecordsForCSVExport(records);

        csvDownloader(filename, { rows: recordsProcessedForExport, columns });
      },
    [filename, processRecordsForCSVExport],
  );

  const { getTableData: download, progress } = useRecordIndexLazyFetchRecords({
    delayMs,
    maximumRequests,
    objectMetadataItem,
    pageSize,
    recordIndexId,
    callback: downloadCsv,
    viewType,
  });

  return { progress, download };
};
