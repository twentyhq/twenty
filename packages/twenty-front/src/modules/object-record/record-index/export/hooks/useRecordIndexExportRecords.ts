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
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/settings/data-model/constants/CompositeFieldSubFieldLabel';
import { formatValueForCSV } from '@/spreadsheet-import/utils/formatValueForCSV';
import { sanitizeValueForCSVExport } from '@/spreadsheet-import/utils/sanitizeValueForCSVExport';
import { t } from '@lingui/core/macro';
import { saveAs } from 'file-saver';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type GenerateExportOptions = {
  columns: Pick<
    ColumnDefinition<FieldMetadata>,
    'label' | 'type' | 'metadata'
  >[];
  rows: Record<string, any>[];
};

type GenerateExport = (data: GenerateExportOptions) => string;

type ExportProgress = {
  exportedRecordCount?: number;
  totalRecordCount?: number;
  displayType: 'percentage' | 'number';
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
    const column = {
      field: `${col.metadata.fieldName}${col.type === 'RELATION' ? 'Id' : ''}`,
      title: formatValueForCSV(sanitizeValueForCSVExport(headerLabel)),
    };

    const columnType = col.type;
    if (!isCompositeFieldType(columnType)) return [column];

    const nestedFieldsWithoutTypename = Object.keys(rows[0][column.field])
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
      // Apply ZWJ sanitization to all string values
      if (typeof value === 'string') {
        sanitizedRow[key] = sanitizeValueForCSVExport(value);
      } else if (isDefined(value) && typeof value === 'object') {
        // Handle nested objects (like composite fields)
        sanitizedRow[key] = {};
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (typeof nestedValue === 'string') {
            sanitizedRow[key][nestedKey] =
              sanitizeValueForCSVExport(nestedValue);
          } else {
            sanitizedRow[key][nestedKey] = nestedValue;
          }
        }
      } else {
        sanitizedRow[key] = value;
      }
    }

    return sanitizedRow;
  });

  return json2csv(sanitizedRows, {
    keys,
    emptyFieldValue: '',
    // Note: We handle CSV injection prevention manually with ZWJ approach above
    // This preserves original which the csvSecurity option does not do
  });
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
        columns: Pick<
          ColumnDefinition<FieldMetadata>,
          'label' | 'type' | 'metadata'
        >[],
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
