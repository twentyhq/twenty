import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useBuildAvailableFieldsForImport } from '@/object-record/spreadsheet-import/hooks/useBuildAvailableFieldsForImport';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

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
    const availableFieldMetadataItems = objectMetadataItem.fields
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.isActive &&
          (!fieldMetadataItem.isSystem || fieldMetadataItem.name === 'id') &&
          fieldMetadataItem.name !== 'createdAt' &&
          (fieldMetadataItem.type !== FieldMetadataType.RELATION ||
            fieldMetadataItem.relationDefinition?.direction ===
              RelationDefinitionType.MANY_TO_ONE),
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
