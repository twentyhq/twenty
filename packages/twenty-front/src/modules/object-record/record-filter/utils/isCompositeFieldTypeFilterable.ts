import { FieldType } from '@/settings/data-model/types/FieldType';

type CompositeFilterableFieldType = Extract<FieldType, 'ACTOR' | 'FULL_NAME'>;

export const isCompositeFieldTypeSubFieldsFilterable = (
  fieldType: FieldType,
): fieldType is CompositeFilterableFieldType => {
  return (
    ['ACTOR', 'FULL_NAME'] satisfies CompositeFilterableFieldType[]
  ).includes(fieldType as any);
};
