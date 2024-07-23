import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import {
  buildFieldMapping,
  useBuildAvailableFieldsArray,
} from '@/object-record/spreadsheet-import/util/fieldsUtil';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useOpenObjectRecordsSpreasheetImportDialog = (
  objectNameSingular: string,
) => {
  const { openSpreadsheetImportDialog } = useOpenSpreadsheetImportDialog<any>();
  const { enqueueSnackBar } = useSnackBar();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fields = objectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.isActive &&
        (!fieldMetadataItem.isSystem || fieldMetadataItem.name === 'id') &&
        fieldMetadataItem.name !== 'createdAt' &&
        (fieldMetadataItem.type !== FieldMetadataType.Relation ||
          fieldMetadataItem.toRelationMetadata),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const availableFields = useBuildAvailableFieldsArray(fields);

  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular,
  });

  const openObjectRecordsSpreasheetImportDialog = (
    options?: Omit<
      SpreadsheetImportDialogOptions<any>,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    openSpreadsheetImportDialog({
      ...options,
      onSubmit: async (data) => {
        const createInputs = data.validData.map((record) => {
          const fieldMapping: Record<string, any> = buildFieldMapping(
            record,
            fields,
          );

          return fieldMapping;
        });

        try {
          await createManyRecords(createInputs, true);
        } catch (error: any) {
          enqueueSnackBar(error?.message || 'Something went wrong', {
            variant: SnackBarVariant.Error,
          });
        }
      },
      fields: availableFields,
    });
  };

  return {
    openObjectRecordsSpreasheetImportDialog,
  };
};
