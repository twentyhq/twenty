import { type FieldType } from '@/settings/data-model/types/FieldType';

const COMPOSITE_TYPES_FILTERABLE = [
  'ACTOR',
  'FULL_NAME',
  'CURRENCY',
  'ADDRESS',
  'PHONES',
  'LINKS',
  'EMAILS',
  // PDF and IMAGE are not filterable by subfields
] satisfies FieldType[];

type FilterableCompositeFieldType = (typeof COMPOSITE_TYPES_FILTERABLE)[number];

export const areCompositeTypeSubFieldsFilterable = (
  fieldType: FieldType,
): fieldType is FilterableCompositeFieldType => {
  return COMPOSITE_TYPES_FILTERABLE.includes(fieldType as any);
};
