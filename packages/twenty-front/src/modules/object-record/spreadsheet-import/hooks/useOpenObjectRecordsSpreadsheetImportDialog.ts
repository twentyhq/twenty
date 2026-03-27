import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useBatchCreateManyRecords } from '@/object-record/hooks/useBatchCreateManyRecords';
import { useBuildSpreadsheetImportFields } from '@/object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import { executeRelationUpdatesViaMutation } from '@/object-record/spreadsheet-import/utils/executeRelationUpdatesViaMutation';
import {
  extractRelationUpdatesFromImportedRows,
  type UnresolvedRelationUpdateEntry,
} from '@/object-record/spreadsheet-import/utils/extractRelationUpdatesFromImportedRows';
import { resolveRelationIdsFromExistingRecords } from '@/object-record/spreadsheet-import/utils/resolveRelationIdsFromExistingRecords';
import { spreadsheetImportFilterAvailableFieldMetadataItems } from '@/object-record/spreadsheet-import/utils/spreadsheetImportFilterAvailableFieldMetadataItems';
import { spreadsheetImportGetUnicityTableHook } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetUnicityTableHook';
import { SPREADSHEET_IMPORT_CREATE_RECORDS_BATCH_SIZE } from '@/spreadsheet-import/constants/SpreadsheetImportCreateRecordsBatchSize';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { spreadsheetImportCreatedRecordsProgressState } from '@/spreadsheet-import/states/spreadsheetImportCreatedRecordsProgressState';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type RelationUpdateEntry } from '@/object-record/spreadsheet-import/utils/extractRelationUpdatesFromImportedRows';

/**
 * For upsert rows (rows with an `id`), strips relation connect clauses that
 * match by non-ID fields (e.g. email). Returns the stripped connect data so it
 * can be merged into relation updates later.
 *
 * This prevents errors like "No unique record found with condition:
 * emailsPrimaryEmail = ..." when the related record's data has changed.
 */
const stripNonIdRelationConnects = (
  createInputs: Record<string, any>[],
  fieldMetadataItems: { name: string; type: FieldMetadataType; relation?: any }[],
  unresolvedRelations: UnresolvedRelationUpdateEntry[],
): Map<string, Map<string, Record<string, any>>> => {
  const unresolvedRelationNames = new Set(
    unresolvedRelations.map((entry) => entry.relationFieldName),
  );

  const relationFieldNames = new Set(
    fieldMetadataItems
      .filter(
        (f) =>
          f.type === FieldMetadataType.RELATION &&
          unresolvedRelationNames.has(f.name),
      )
      .map((f) => f.name),
  );

  // Map<parentRecordId, Map<relationFieldName, connectWhereData>>
  const strippedConnectData = new Map<
    string,
    Map<string, Record<string, any>>
  >();

  for (const input of createInputs) {
    const parentId = input.id;
    if (!isDefined(parentId) || !isNonEmptyString(parentId)) continue;

    for (const fieldName of relationFieldNames) {
      const value = input[fieldName];
      if (!isDefined(value?.connect?.where)) continue;

      const whereClause = value.connect.where;

      // If connect is by ID, leave it alone — it should work fine
      if (isDefined(whereClause.id)) continue;

      // Save the connect data for later merging into update records
      if (!strippedConnectData.has(parentId)) {
        strippedConnectData.set(parentId, new Map());
      }
      strippedConnectData.get(parentId)!.set(fieldName, whereClause);

      // Remove the connect clause so the upsert preserves the existing relation
      delete input[fieldName];
    }
  }

  return strippedConnectData;
};

/**
 * Resolves unresolved relation updates by querying existing parent records for
 * their relation foreign key values, then merging any stripped connect data
 * (e.g. email values) with the update field data.
 */
const resolveAndBuildRelationUpdates = async ({
  apolloClient,
  parentObjectMetadataItem,
  unresolvedEntries,
  strippedConnectData,
}: {
  apolloClient: any;
  parentObjectMetadataItem: { nameSingular: string; namePlural: string };
  unresolvedEntries: UnresolvedRelationUpdateEntry[];
  strippedConnectData: Map<string, Map<string, Record<string, any>>>;
}): Promise<RelationUpdateEntry[]> => {
  const result: RelationUpdateEntry[] = [];

  for (const entry of unresolvedEntries) {
    const parentIds = Object.keys(entry.updateDataByParentId);

    // Also include parent IDs that only have connect data (no update fields)
    for (const [parentId, connectMap] of strippedConnectData) {
      if (connectMap.has(entry.relationFieldName) && !parentIds.includes(parentId)) {
        parentIds.push(parentId);
      }
    }

    if (parentIds.length === 0) continue;

    const parentToRelationId = await resolveRelationIdsFromExistingRecords({
      apolloClient,
      parentObjectMetadataItem:
        parentObjectMetadataItem as any,
      parentRecordIds: parentIds,
      relationFieldName: entry.relationFieldName,
    });

    const updateRecords: Record<string, any>[] = [];

    for (const parentId of parentIds) {
      const relationId = parentToRelationId.get(parentId);
      if (!isDefined(relationId)) continue;

      const updateData = entry.updateDataByParentId[parentId] ?? {};
      const connectData =
        strippedConnectData.get(parentId)?.get(entry.relationFieldName) ?? {};

      // Merge: connect data (e.g. emails) + update field data (e.g. name, phone)
      const mergedRecord: Record<string, any> = { id: relationId };

      for (const [key, value] of Object.entries(connectData)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          mergedRecord[key] = { ...value, ...(mergedRecord[key] ?? {}) };
        } else {
          mergedRecord[key] = value;
        }
      }

      for (const [key, value] of Object.entries(updateData)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          mergedRecord[key] = { ...(mergedRecord[key] ?? {}), ...value };
        } else {
          mergedRecord[key] = value;
        }
      }

      if (Object.keys(mergedRecord).length > 1) {
        updateRecords.push(mergedRecord);
      }
    }

    if (updateRecords.length > 0) {
      result.push({
        targetObjectMetadataItem: entry.targetObjectMetadataItem,
        updateRecords,
      });
    }
  }

  return result;
};

export const useOpenObjectRecordsSpreadsheetImportDialog = (
  objectNameSingular: string,
) => {
  const apolloCoreClient = useApolloCoreClient();
  const { openSpreadsheetImportDialog } = useOpenSpreadsheetImportDialog();
  const { buildSpreadsheetImportFields } = useBuildSpreadsheetImportFields();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { enqueueErrorSnackBar } = useSnackBar();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const setSpreadsheetImportCreatedRecordsProgress = useSetAtomState(
    spreadsheetImportCreatedRecordsProgressState,
  );

  const abortController = new AbortController();

  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular,
    depth: 0,
  });

  const { batchCreateManyRecords } = useBatchCreateManyRecords({
    objectNameSingular,
    recordGqlFields,
    mutationBatchSize: SPREADSHEET_IMPORT_CREATE_RECORDS_BATCH_SIZE,
    setBatchedRecordsCount: setSpreadsheetImportCreatedRecordsProgress,
    abortController,
  });

  const openObjectRecordsSpreadsheetImportDialog = (
    options?: Omit<
      SpreadsheetImportDialogOptions,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    const availableFieldMetadataItemsToImport =
      spreadsheetImportFilterAvailableFieldMetadataItems(
        objectMetadataItem.updatableFields,
      );

    const spreadsheetImportFields = buildSpreadsheetImportFields(
      availableFieldMetadataItemsToImport,
    );

    openSpreadsheetImportDialog({
      ...options,
      onSubmit: async (data) => {
        const createInputs = data.validStructuredRows.map((record) => {
          const fieldMapping: Record<string, any> =
            buildRecordFromImportedStructuredRow({
              importedStructuredRow: record,
              fieldMetadataItems: availableFieldMetadataItemsToImport,
              spreadsheetImportFields,
            });

          return fieldMapping;
        });

        const { resolved: relationUpdates, unresolved: unresolvedRelationUpdates } =
          extractRelationUpdatesFromImportedRows({
            importedStructuredRows: data.validStructuredRows,
            spreadsheetImportFields,
            fieldMetadataItems: availableFieldMetadataItemsToImport,
            objectMetadataItems: objectMetadataItems ?? [],
          });

        // For upsert rows with unresolved relation updates, strip non-ID
        // connect clauses to avoid "no record found" errors. The relation
        // data will be applied via direct updates after resolving IDs.
        const strippedConnectData =
          unresolvedRelationUpdates.length > 0
            ? stripNonIdRelationConnects(
                createInputs,
                availableFieldMetadataItemsToImport,
                unresolvedRelationUpdates,
              )
            : new Map<string, Map<string, Record<string, any>>>();

        try {
          await batchCreateManyRecords({
            recordsToCreate: createInputs,
            upsert: true,
          });

          // Resolve relation IDs from existing records and execute updates
          const allRelationUpdates = [...relationUpdates];

          if (unresolvedRelationUpdates.length > 0) {
            const resolvedUpdates = await resolveAndBuildRelationUpdates({
              apolloClient: apolloCoreClient,
              parentObjectMetadataItem: objectMetadataItem,
              unresolvedEntries: unresolvedRelationUpdates,
              strippedConnectData,
            });
            allRelationUpdates.push(...resolvedUpdates);
          }

          if (allRelationUpdates.length > 0) {
            await executeRelationUpdatesViaMutation({
              apolloClient: apolloCoreClient,
              relationUpdates: allRelationUpdates,
              batchSize: SPREADSHEET_IMPORT_CREATE_RECORDS_BATCH_SIZE,
            });
          }

          const evictFieldNames = new Set([objectMetadataItem.namePlural]);
          for (const update of allRelationUpdates) {
            evictFieldNames.add(update.targetObjectMetadataItem.namePlural);
          }

          await apolloCoreClient.refetchQueries({
            updateCache: (cache) => {
              for (const fieldName of evictFieldNames) {
                cache.evict({ fieldName });
              }
            },
          });
        } catch (error: any) {
          enqueueErrorSnackBar({
            apolloError: error,
          });
        }
      },
      spreadsheetImportFields,
      availableFieldMetadataItems: availableFieldMetadataItemsToImport,
      onAbortSubmit: () => {
        abortController.abort();
      },
      tableHook: spreadsheetImportGetUnicityTableHook(objectMetadataItem),
    });
  };

  return {
    openObjectRecordsSpreadsheetImportDialog,
  };
};
