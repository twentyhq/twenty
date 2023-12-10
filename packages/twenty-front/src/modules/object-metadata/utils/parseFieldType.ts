import { FieldType } from '@/object-record/field/types/FieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const parseFieldType = (fieldType: FieldMetadataType): FieldType => {
  if (fieldType === FieldMetadataType.Link) {
    return 'LINK';
  }

  if (fieldType === FieldMetadataType.Currency) {
    return 'CURRENCY';
  }

  return fieldType as FieldType;
};
