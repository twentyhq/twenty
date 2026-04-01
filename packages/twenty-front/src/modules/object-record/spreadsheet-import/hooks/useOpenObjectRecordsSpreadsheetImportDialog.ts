import { useApolloClient } from '@apollo/client/react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useBuildSpreadsheetImportFields } from '@/object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import { spreadsheetImportFilterAvailableFieldMetadataItems } from '@/object-record/spreadsheet-import/utils/spreadsheetImportFilterAvailableFieldMetadataItems';
import { spreadsheetImportGetUnicityTableHook } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetUnicityTableHook';
import { APPEND_IMPORT_JOB_ROWS } from '@/spreadsheet-import/graphql/mutations/appendImportJobRows';
import { CREATE_IMPORT_JOB } from '@/spreadsheet-import/graphql/mutations/createImportJob';
import { FINALIZE_IMPORT_JOB } from '@/spreadsheet-import/graphql/mutations/finalizeImportJob';
import { START_IMPORT_JOB } from '@/spreadsheet-import/graphql/mutations/startImportJob';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { useImportJobProgress } from '@/spreadsheet-import/hooks/useImportJobProgress';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const CHUNK_SIZE = 500;

export const useOpenObjectRecordsSpreadsheetImportDialog = (
  objectNameSingular: string,
) => {
  const apolloMetadataClient = useApolloClient();
  const { openSpreadsheetImportDialog } = useOpenSpreadsheetImportDialog();
  const { buildSpreadsheetImportFields } = useBuildSpreadsheetImportFields();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { startTracking } = useImportJobProgress();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
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

    const columnMappings = spreadsheetImportFields.map((field) => ({
      key: field.key,
      label: field.label,
      fieldMetadataItemId: field.fieldMetadataItemId,
      isRelationConnectField: field.isRelationConnectField ?? false,
      isRelationUpdateField: field.isRelationUpdateField ?? false,
    }));

    openSpreadsheetImportDialog({
      ...options,
      onSubmit: async (data) => {
        const createInputs = data.validStructuredRows.map((record) =>
          buildRecordFromImportedStructuredRow({
            importedStructuredRow: record,
            fieldMetadataItems: availableFieldMetadataItemsToImport,
            spreadsheetImportFields,
          }),
        );

        try {
          if (createInputs.length <= CHUNK_SIZE) {
            // Small import: single mutation
            await submitSingleBatch(createInputs, columnMappings);
          } else {
            // Large import: chunked upload
            await submitChunked(createInputs, columnMappings);
          }
        } catch (error) {
          if (error instanceof Error) {
            enqueueErrorSnackBar({ apolloError: error });
          }

        }
      },
      spreadsheetImportFields,
      availableFieldMetadataItems: availableFieldMetadataItemsToImport,
      tableHook: spreadsheetImportGetUnicityTableHook(objectMetadataItem),
    });
  };

  const submitSingleBatch = async (
    rows: Record<string, unknown>[],
    mappings: Record<string, unknown>[],
  ) => {
    const { data: result } = await apolloMetadataClient.mutate({
      mutation: START_IMPORT_JOB,
      variables: {
        objectNameSingular,
        columnMappings: mappings,
        validatedRows: rows,
        fileName: undefined,
      },
    });

    const importJob = (result as { startImportJob?: { id: string; totalRecords: number } })
      ?.startImportJob;

    if (importJob?.id) {
      startTracking({
        importJobId: importJob.id,
        objectNameSingular,
        totalRecords: importJob.totalRecords,
      });
    }
  };

  const submitChunked = async (
    rows: Record<string, unknown>[],
    mappings: Record<string, unknown>[],
  ) => {
    // 1. Create the job shell (no rows)
    const { data: createResult } = await apolloMetadataClient.mutate({
      mutation: CREATE_IMPORT_JOB,
      variables: {
        objectNameSingular,
        columnMappings: mappings,
        fileName: undefined,
      },
    });

    const jobId = (createResult as { createImportJob?: { id: string } })
      ?.createImportJob?.id;

    if (!jobId) throw new Error('Failed to create import job');

    // 2. Send rows in chunks
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);

      await apolloMetadataClient.mutate({
        mutation: APPEND_IMPORT_JOB_ROWS,
        variables: { importJobId: jobId, rows: chunk },
      });
    }

    // 3. Finalize — queues the job for processing
    const { data: finalizeResult } = await apolloMetadataClient.mutate({
      mutation: FINALIZE_IMPORT_JOB,
      variables: { importJobId: jobId },
    });

    const totalRecords = (
      finalizeResult as { finalizeImportJob?: { totalRecords: number } }
    )?.finalizeImportJob?.totalRecords ?? rows.length;

    startTracking({
      importJobId: jobId,
      objectNameSingular,
      totalRecords,
    });
  };

  return {
    openObjectRecordsSpreadsheetImportDialog,
  };
};
