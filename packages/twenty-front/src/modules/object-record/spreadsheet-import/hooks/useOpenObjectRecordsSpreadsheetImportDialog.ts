import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useBatchCreateManyRecords } from '@/object-record/hooks/useBatchCreateManyRecords';
import { useBuildAvailableFieldsForImport } from '@/object-record/spreadsheet-import/hooks/useBuildAvailableFieldsForImport';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const useOpenObjectRecordsSpreadsheetImportDialog = (
  objectNameSingular: string,
) => {
  const { openSpreadsheetImportDialog } = useOpenSpreadsheetImportDialog<any>();
  const { enqueueSnackBar } = useSnackBar();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { batchCreateManyRecords } = useBatchCreateManyRecords({
    objectNameSingular,
    mutationBatchSize: 1,
    skipPostOptimisticEffect: true,
  });

  const { buildAvailableFieldsForImport } = useBuildAvailableFieldsForImport();

  const openObjectRecordsSpreadsheetImportDialog = (
    options?: Omit<
      SpreadsheetImportDialogOptions<any>,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    const availableFieldMetadataItems = objectMetadataItem.fields
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.isActive &&
          (!fieldMetadataItem.isSystem || fieldMetadataItem.name === 'id') &&
          fieldMetadataItem.name !== 'createdAt' &&
          fieldMetadataItem.name !== 'updatedAt' &&
          (fieldMetadataItem.type !== FieldMetadataType.RELATION ||
            fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE),
      )
      .sort((fieldMetadataItemA, fieldMetadataItemB) =>
        fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
      );

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
          await batchCreateManyRecords({
            recordsToCreate: createInputs,
            upsert: true,
          });
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
