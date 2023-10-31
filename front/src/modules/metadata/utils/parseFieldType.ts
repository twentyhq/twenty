import { FieldType } from '@/ui/data/field/types/FieldType';

export const parseFieldType = (fieldType: string): FieldType => {
  if (fieldType === 'url') {
    return 'urlV2';
  }

  if (fieldType === 'money') {
    return 'moneyAmountV2';
  }

  return fieldType as FieldType;
};
