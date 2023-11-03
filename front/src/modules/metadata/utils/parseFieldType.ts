import { FieldType } from '@/ui/object/field/types/FieldType';

export const parseFieldType = (fieldType: string): FieldType => {
  if (fieldType === 'url') {
    return 'URL_V2';
  }

  if (fieldType === 'money') {
    return 'MONEY_AMOUNT_V2';
  }

  return fieldType as FieldType;
};
