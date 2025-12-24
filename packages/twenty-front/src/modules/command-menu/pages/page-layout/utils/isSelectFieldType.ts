import { FieldMetadataType } from 'twenty-shared/types';

export const isSelectFieldType = (
  fieldType: FieldMetadataType | undefined,
): boolean => {
  return (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  );
};
