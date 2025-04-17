import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldValueReadOnly } from '../utils/isFieldValueReadOnly';

type UseIsFieldValueReadOnlyParams = {
  isRecordReadOnly: boolean;
  fieldDefinition: FieldDefinition<FieldMetadata>;
};

export const useIsFieldValueReadOnly = ({
  fieldDefinition,
  isRecordReadOnly,
}: UseIsFieldValueReadOnlyParams) => {
  const { metadata, type } = fieldDefinition;

  return isFieldValueReadOnly({
    objectNameSingular: metadata.objectMetadataNameSingular,
    fieldName: metadata.fieldName,
    fieldType: type,
    isRecordReadOnly,
    isCustom: metadata.isCustom,
  });
};
