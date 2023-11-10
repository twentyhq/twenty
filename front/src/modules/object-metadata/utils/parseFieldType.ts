import { FieldType } from '@/ui/object/field/types/FieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const parseFieldType = (fieldType: FieldMetadataType): FieldType => {
  if (fieldType === FieldMetadataType.Url) {
    return 'URL_V2';
  }

  if (fieldType === FieldMetadataType.Money) {
    return 'MONEY_AMOUNT_V2';
  }

  return fieldType as FieldType;
};
