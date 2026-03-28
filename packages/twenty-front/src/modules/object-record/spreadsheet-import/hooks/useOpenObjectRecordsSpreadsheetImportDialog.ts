import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useBatchCreateManyRecords } from '@/object-record/hooks/useBatchCreateManyRecords';
import { useBuildSpreadsheetImportFields } from '@/object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import { executeRelationUpdatesViaMutation } from '@/object-record/spreadsheet-import/utils/executeRelationUpdatesViaMutation';
import { extractRelationUpdatesFromImportedRows } from '@/object-record/spreadsheet-import/utils/extractRelationUpdatesFromImportedRows';
import { spreadsheetImportFilterAvailableFieldMetadataItems } from '@/object-record/spreadsheet-import/utils/spreadsheetImportFilterAvailableFieldMetadataItems';
import { spreadsheetImportGetUnicityTableHook } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetUnicityTableHook';
import { ImportResultsSummary } from '@/spreadsheet-import/components/ImportResultsSummary';
import { SPREADSHEET_IMPORT_CREATE_RECORDS_BATCH_SIZE } from '@/spreadsheet-import/constants/SpreadsheetImportCreateRecordsBatchSize';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { spreadsheetImportCreatedRecordsProgressState } from '@/spreadsheet-import/states/spreadsheetImportCreatedRecordsProgressState';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import React from 'react';

export const useOpenObjectRecordsSpreadsheetImportDialog = (
  objectNameSingular: string,
) => {
  const apolloCoreClient = useApolloCoreClient();
  const { openSpreadsheetImportDialog } = useOpenSpreadsheetImportDialog();
  const { buildSpreadsheetImportFields } = useBuildSpreadsheetImportFields();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { enqueueDialog } = useDialogManager();

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

        const relationUpdates = extractRelationUpdatesFromImportedRows({
          importedStructuredRows: data.validStructuredRows,
          spreadsheetImportFields,
          fieldMetadataItems: availableFieldMetadataItemsToImport,
          objectMetadataItems: objectMetadataItems ?? [],
        });

        try {
          const { warnings, failures } = await batchCreateManyRecords({
            recordsToCreate: createInputs,
            upsert: true,
          });

          if (relationUpdates.length > 0) {
            await executeRelationUpdatesViaMutation({
              apolloClient: apolloCoreClient,
              relationUpdates,
              batchSize: SPREADSHEET_IMPORT_CREATE_RECORDS_BATCH_SIZE,
            });
          }

          const evictFieldNames = new Set([objectMetadataItem.namePlural]);
          for (const update of relationUpdates) {
            evictFieldNames.add(update.targetObjectMetadataItem.namePlural);
          }

          await apolloCoreClient.refetchQueries({
            updateCache: (cache) => {
              for (const fieldName of evictFieldNames) {
                cache.evict({ fieldName });
              }
            },
          });

          // Show results summary if there were any issues
          const hasIssues = warnings.length > 0 || failures.length > 0;

          if (hasIssues) {
            const totalRecords = data.validStructuredRows.length;
            const successCount =
              totalRecords - warnings.length - failures.length;
            const columns = spreadsheetImportFields.map((field) => ({
              key: field.key,
              label: field.label,
            }));

            enqueueDialog({
              title: t`Import Results`,
              children: React.createElement(ImportResultsSummary, {
                totalRecords,
                successCount,
                warnings,
                failures,
                originalRows: data.validStructuredRows,
                columns,
                objectNameSingular,
              }),
              buttons: [
                {
                  title: t`Close`,
                  variant: 'secondary' as const,
                  role: 'confirm' as const,
                },
              ],
            });
          } else {
            enqueueSuccessSnackBar({
              message: t`${data.validStructuredRows.length} records imported successfully.`,
            });
          }
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
