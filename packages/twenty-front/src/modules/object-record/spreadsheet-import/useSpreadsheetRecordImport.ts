import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import {
  buildFieldMapping,
  useBuildAvailableFieldsArray,
} from '@/object-record/spreadsheet-import/util/fieldsUtil';
import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useSpreadsheetRecordImport = (objectNameSingular: string) => {
  const { openSpreadsheetImport } = useSpreadsheetImport<any>();
  const { enqueueSnackBar } = useSnackBar();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const fields = objectMetadataItem.fields
    .filter(
      (x) =>
        x.isActive &&
        (!x.isSystem || x.name === 'id') &&
        x.name !== 'createdAt' &&
        (x.type !== FieldMetadataType.Relation || x.toRelationMetadata),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const availableFields = useBuildAvailableFieldsArray(fields);

  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular,
  });

  const openRecordSpreadsheetImport = (
    options?: Omit<SpreadsheetOptions<any>, 'fields' | 'isOpen' | 'onClose'>,
  ) => {
    openSpreadsheetImport({
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

  return { openRecordSpreadsheetImport };
};
