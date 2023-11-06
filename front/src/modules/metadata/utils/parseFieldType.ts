import { FieldType } from '@/ui/object/field/types/FieldType';

export const parseFieldType = (fieldType: FieldType): FieldType => {
  if (fieldType === 'URL') {
    return 'URL_V2';
  }

  if (fieldType === 'MONEY') {
    return 'MONEY_AMOUNT_V2';
  }

  return fieldType as FieldType;
};
