import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useBuildSpreadsheetImportFields } from '@/object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import { spreadsheetImportFilterAvailableFieldMetadataItems } from '@/object-record/spreadsheet-import/utils/spreadsheetImportFilterAvailableFieldMetadataItems';
import { spreadsheetImportGetUnicityTableHook } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetUnicityTableHook';
import { START_IMPORT_JOB } from '@/spreadsheet-import/graphql/mutations/startImportJob';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { useImportJobProgress } from '@/spreadsheet-import/hooks/useImportJobProgress';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useOpenObjectRecordsSpreadsheetImportDialog = (
  objectNameSingular: string,
) => {
  const apolloCoreClient = useApolloCoreClient();
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

    openSpreadsheetImportDialog({
      ...options,
      onSubmit: async (data) => {
        // Transform validated rows into record inputs
        const createInputs = data.validStructuredRows.map((record) =>
          buildRecordFromImportedStructuredRow({
            importedStructuredRow: record,
            fieldMetadataItems: availableFieldMetadataItemsToImport,
            spreadsheetImportFields,
          }),
        );

        try {
          // Send to server for background processing via core/metadata endpoint
          const { data: result } = await apolloCoreClient.mutate({
            mutation: START_IMPORT_JOB,
            variables: {
              objectNameSingular,
              columnMappings: spreadsheetImportFields.map((field) => ({
                key: field.key,
                label: field.label,
                fieldMetadataItemId: field.fieldMetadataItemId,
                isRelationConnectField:
                  field.isRelationConnectField ?? false,
                isRelationUpdateField:
                  field.isRelationUpdateField ?? false,
              })),
              validatedRows: createInputs,
              fileName: undefined,
            },
          });

          const importJob = (result as any)?.startImportJob;

          if (importJob?.id) {
            startTracking({
              importJobId: importJob.id,
              objectNameSingular,
              totalRecords: importJob.totalRecords,
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
      tableHook: spreadsheetImportGetUnicityTableHook(objectMetadataItem),
    });
  };

  return {
    openObjectRecordsSpreadsheetImportDialog,
  };
};
