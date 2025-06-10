import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useBuildAvailableFieldsForImport } from '@/object-record/spreadsheet-import/hooks/useBuildAvailableFieldsForImport';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import { filterAvailableFieldMetadataItemsToImport } from '@/object-record/spreadsheet-import/utils/filterAvailableFieldMetadataItemsToImport';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useOpenObjectRecordsSpreadsheetImportDialog = (
  objectNameSingular: string,
) => {
  const { openSpreadsheetImportDialog } = useOpenSpreadsheetImportDialog<any>();
  const { enqueueSnackBar } = useSnackBar();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular,
  });

  const { buildAvailableFieldsForImport } = useBuildAvailableFieldsForImport();

  const openObjectRecordsSpreadsheetImportDialog = (
    options?: Omit<
      SpreadsheetImportDialogOptions<any>,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    const availableFieldMetadataItems =
      filterAvailableFieldMetadataItemsToImport(objectMetadataItem.fields);

    const availableFields = buildAvailableFieldsForImport(
      availableFieldMetadataItems,
    );

    openSpreadsheetImportDialog({
      ...options,
      onSubmit: async (data) => {
        const createInputs = data.validStructuredRows.map((record) => {
          const fieldMapping: Record<string, any> =
            buildRecordFromImportedStructuredRow({
              importedStructuredRow: record,
              fields: availableFieldMetadataItems,
            });

          return fieldMapping;
        });

        try {
          const upsert = true;
          await createManyRecords(createInputs, upsert);
        } catch (error: any) {
          enqueueSnackBar(error?.message || 'Something went wrong', {
            variant: SnackBarVariant.Error,
          });
        }
      },
      fields: availableFields,
      availableFieldMetadataItems,
    });
  };

  return {
    openObjectRecordsSpreadsheetImportDialog,
  };
};
