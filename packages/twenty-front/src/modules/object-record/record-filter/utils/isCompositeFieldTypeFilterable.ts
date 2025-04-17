import { FieldType } from '@/settings/data-model/types/FieldType';

export const isCompositeFieldTypeSubFieldsFilterable = (
  fieldType: FieldType,
) => {
  return ['ACTOR', 'FULL_NAME'].includes(fieldType);
};
