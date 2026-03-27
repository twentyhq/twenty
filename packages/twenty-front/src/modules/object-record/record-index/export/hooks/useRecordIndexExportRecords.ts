import { json2csv } from 'json-2-csv';
import { useCallback, useMemo } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE } from '@/object-record/object-options-dropdown/constants/ExportTableDataDefaultPageSize';
import { useExportProcessRecordsForCSV } from '@/object-record/object-options-dropdown/hooks/useExportProcessRecordsForCSV';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  useRecordIndexLazyFetchRecords,
  type UseRecordDataOptions,
} from '@/object-record/record-index/export/hooks/useRecordIndexLazyFetchRecords';
import { type ExportConfig } from '@/object-record/record-index/export/types/ExportConfig';
import {
  buildExportableRelationFieldPaths,
  buildRecordGqlFieldsFromSelectedFieldPaths,
  getRelationFieldFlatKey,
  getRelationFieldValueFromPath,
} from '@/object-record/record-index/export/utils/relationExportFieldPaths';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
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
    const headerLabel = col.label;
    const column = {
      field: col.metadata.fieldName,
      title: formatValueForCSV(sanitizeValueForCSVExport(headerLabel)),
    };

    const columnType = col.type;
    if (!isCompositeFieldType(columnType)) return [column];

    const fieldData = rows[0]?.[column.field];
    if (!isDefined(fieldData) || typeof fieldData !== 'object') {
      return [column];
    }

    const nestedFieldsWithoutTypename = Object.keys(fieldData)
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
      if (typeof value === 'string') {
        sanitizedRow[key] = sanitizeValueForCSVExport(value);
      } else if (isDefined(value) && typeof value === 'object') {
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

  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

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

  const {
    getTableData: download,
    progress,
    fetchAllRecords,
    finalColumns,
  } = useRecordIndexLazyFetchRecords({
    delayMs,
    maximumRequests,
    objectMetadataItem,
    pageSize,
    recordIndexId,
    callback: downloadCsv,
    viewType,
  });

  const fetchRelationSubFieldData = useCallback(
    async (
      records: ObjectRecord[],
      config: ExportConfig,
    ): Promise<Map<string, Map<string, ObjectRecord>>> => {
      const result = new Map<string, Map<string, ObjectRecord>>();

      for (const relationConfig of config.relationConfigs) {
        const relationFieldMetadata = objectMetadataItem.fields.find(
          (f) => f.name === relationConfig.relationFieldName,
        );
        const joinColumnName =
          relationFieldMetadata?.settings?.joinColumnName ??
          `${relationConfig.relationFieldName}Id`;

        const relatedIds = records
          .map((record) => record[joinColumnName] as string | undefined)
          .filter(isDefined)
          .filter(
            (id: string, index: number, self: string[]) =>
              self.indexOf(id) === index,
          );

        if (relatedIds.length === 0) {
          result.set(relationConfig.relationFieldName, new Map());
          continue;
        }

        const targetObjectMetadataItem = objectMetadataItems.find(
          (item) =>
            item.nameSingular === relationConfig.targetObjectNameSingular,
        );

        if (!isDefined(targetObjectMetadataItem)) {
          result.set(relationConfig.relationFieldName, new Map());
          continue;
        }

        const recordGqlFields = buildRecordGqlFieldsFromSelectedFieldPaths(
          relationConfig.selectedFieldPaths,
        );

        try {
          const query = generateFindManyRecordsQuery({
            objectMetadataItem: targetObjectMetadataItem,
            objectMetadataItems,
            recordGqlFields,
            objectPermissionsByObjectMetadataId,
          });

          const batchSize = 200;
          const lookupMap = new Map<string, ObjectRecord>();

          for (let i = 0; i < relatedIds.length; i += batchSize) {
            const batchIds = relatedIds.slice(i, i + batchSize);

            const queryResult = await apolloCoreClient.query({
              query,
              variables: {
                filter: { id: { in: batchIds } },
                limit: batchIds.length,
              },
              fetchPolicy: 'network-only',
            });

            const edges =
              (queryResult.data as Record<string, any> | undefined)?.[
                targetObjectMetadataItem.namePlural
              ]?.edges ?? [];

            for (const edge of edges) {
              if (isDefined(edge.node?.id)) {
                lookupMap.set(edge.node.id, edge.node);
              }
            }
          }

          result.set(relationConfig.relationFieldName, lookupMap);
        } catch {
          result.set(relationConfig.relationFieldName, new Map());
        }
      }

      return result;
    },
    [
      apolloCoreClient,
      objectMetadataItem.fields,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const buildExpandedColumnsAndRows = useCallback(
    (
      records: ObjectRecord[],
      columns: Pick<
        ColumnDefinition<FieldMetadata>,
        'label' | 'type' | 'metadata'
      >[],
      config: ExportConfig,
      relationDataMap: Map<string, Map<string, ObjectRecord>>,
    ) => {
      // Always include 'id' for each relation so re-imports can match by ID
      const augmentedConfig: ExportConfig = {
        ...config,
        relationConfigs: config.relationConfigs.map((rc) =>
          rc.selectedFieldPaths.includes('id')
            ? rc
            : { ...rc, selectedFieldPaths: ['id', ...rc.selectedFieldPaths] },
        ),
      };

      const configuredRelationFieldNames = new Set(
        augmentedConfig.relationConfigs.map((rc) => rc.relationFieldName),
      );

      const expandedColumns: Pick<
        ColumnDefinition<FieldMetadata>,
        'label' | 'type' | 'metadata'
      >[] = [];

      for (const column of columns) {
        const fieldName = column.metadata.fieldName;

        if (!configuredRelationFieldNames.has(fieldName)) {
          expandedColumns.push(column);
          continue;
        }

        const relationConfig = augmentedConfig.relationConfigs.find(
          (rc) => rc.relationFieldName === fieldName,
        );

        if (!isDefined(relationConfig)) {
          expandedColumns.push(column);
          continue;
        }

        const targetObjectMetadataItem = objectMetadataItems.find(
          (item) =>
            item.nameSingular === relationConfig.targetObjectNameSingular,
        );

        if (!isDefined(targetObjectMetadataItem)) {
          expandedColumns.push(column);
          continue;
        }

        const exportableFieldPaths = buildExportableRelationFieldPaths({
          objectMetadataItem: targetObjectMetadataItem,
          objectMetadataItems,
        }).filter((subField) =>
          relationConfig.selectedFieldPaths.includes(subField.fieldPath),
        );

        for (const exportableFieldPath of exportableFieldPaths) {
          if (isCompositeFieldType(exportableFieldPath.fieldType)) {
            const subFieldLabels =
              COMPOSITE_FIELD_SUB_FIELD_LABELS[exportableFieldPath.fieldType];

            for (const [compositeKey, compositeLabel] of Object.entries(
              subFieldLabels,
            )) {
              const flatFieldName = `${getRelationFieldFlatKey(fieldName, exportableFieldPath.fieldPath)}__${compositeKey}`;
              expandedColumns.push({
                label: `${relationConfig.relationFieldLabel} / ${exportableFieldPath.fieldLabel} / ${compositeLabel}`,
                type: FieldMetadataType.TEXT,
                metadata: {
                  fieldName: flatFieldName,
                },
              });
            }
          } else {
            const flatFieldName = getRelationFieldFlatKey(
              fieldName,
              exportableFieldPath.fieldPath,
            );
            expandedColumns.push({
              label: `${relationConfig.relationFieldLabel} / ${exportableFieldPath.fieldLabel}`,
              type: exportableFieldPath.fieldType,
              metadata: {
                fieldName: flatFieldName,
              },
            });
          }
        }
      }

      // Pre-compute field path metadata per relation
      const relationSubFieldTypes = new Map<
        string,
        Map<string, FieldMetadataType>
      >();
      for (const rc of augmentedConfig.relationConfigs) {
        const targetMeta = objectMetadataItems.find(
          (item) => item.nameSingular === rc.targetObjectNameSingular,
        );
        const subFieldTypes = new Map<string, FieldMetadataType>();
        if (isDefined(targetMeta)) {
          const exportableFieldPaths = buildExportableRelationFieldPaths({
            objectMetadataItem: targetMeta,
            objectMetadataItems,
          });

          for (const exportableFieldPath of exportableFieldPaths) {
            if (
              !rc.selectedFieldPaths.includes(exportableFieldPath.fieldPath)
            ) {
              continue;
            }

            subFieldTypes.set(
              exportableFieldPath.fieldPath,
              exportableFieldPath.fieldType,
            );
          }
        }
        relationSubFieldTypes.set(rc.relationFieldName, subFieldTypes);
      }

      const expandedRows = records.map((record) => {
        const expandedRecord = { ...record };

        for (const relationConfig of augmentedConfig.relationConfigs) {
          const lookupMap = relationDataMap.get(
            relationConfig.relationFieldName,
          );
          const relationFieldMetadata = objectMetadataItem.fields.find(
            (f) => f.name === relationConfig.relationFieldName,
          );
          const joinColumnName =
            relationFieldMetadata?.settings?.joinColumnName ??
            `${relationConfig.relationFieldName}Id`;
          const relatedId = record[joinColumnName] as string | undefined;
          const relatedRecord =
            isDefined(relatedId) && isDefined(lookupMap)
              ? lookupMap.get(relatedId)
              : undefined;

          const subFieldTypes = relationSubFieldTypes.get(
            relationConfig.relationFieldName,
          );

          for (const selectedFieldPath of relationConfig.selectedFieldPaths) {
            const rawValue = getRelationFieldValueFromPath(
              relatedRecord,
              selectedFieldPath,
            );
            const fieldType = subFieldTypes?.get(selectedFieldPath);

            if (
              isDefined(rawValue) &&
              typeof rawValue === 'object' &&
              isDefined(fieldType) &&
              isCompositeFieldType(fieldType)
            ) {
              const compositeRecord = rawValue as Record<string, unknown>;
              const subFieldLabels =
                COMPOSITE_FIELD_SUB_FIELD_LABELS[fieldType];

              for (const compositeKey of Object.keys(subFieldLabels)) {
                const flatFieldName = `${getRelationFieldFlatKey(
                  relationConfig.relationFieldName,
                  selectedFieldPath,
                )}__${compositeKey}`;
                expandedRecord[flatFieldName] =
                  compositeRecord[compositeKey] ?? '';
              }
            } else {
              const flatFieldName = getRelationFieldFlatKey(
                relationConfig.relationFieldName,
                selectedFieldPath,
              );
              expandedRecord[flatFieldName] = rawValue ?? '';
            }
          }
        }

        return expandedRecord;
      });

      const processedRows = processRecordsForCSVExport(
        expandedRows,
        configuredRelationFieldNames,
      );

      return { expandedColumns, processedRows };
    },
    [
      objectMetadataItem.fields,
      objectMetadataItems,
      processRecordsForCSVExport,
    ],
  );

  const downloadWithConfig = useCallback(
    async (config: ExportConfig) => {
      const records = await fetchAllRecords();

      if (records.length === 0) {
        return;
      }

      if (config.relationConfigs.length === 0) {
        const recordsProcessedForExport = processRecordsForCSVExport(records);
        csvDownloader(filename, {
          rows: recordsProcessedForExport,
          columns: finalColumns,
        });
        return;
      }

      const relationDataMap = await fetchRelationSubFieldData(records, config);

      const { expandedColumns, processedRows } = buildExpandedColumnsAndRows(
        records,
        finalColumns,
        config,
        relationDataMap,
      );

      csvDownloader(filename, {
        rows: processedRows,
        columns: expandedColumns,
      });
    },
    [
      fetchAllRecords,
      processRecordsForCSVExport,
      filename,
      finalColumns,
      fetchRelationSubFieldData,
      buildExpandedColumnsAndRows,
    ],
  );

  return { progress, download, downloadWithConfig, finalColumns };
};
