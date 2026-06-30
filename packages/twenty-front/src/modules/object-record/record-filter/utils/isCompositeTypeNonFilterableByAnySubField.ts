import { type FieldType } from '@/settings/data-model/types/FieldType';

const COMPOSITE_TYPES_NON_FILTERABLE_WITH_ANY = [
  'ACTOR',
  'CURRENCY',
] satisfies FieldType[];

type CompositeTypeNonFilterableWithAny =
  (typeof COMPOSITE_TYPES_NON_FILTERABLE_WITH_ANY)[number];

export const isCompositeTypeNonFilterableByAnySubField = (
  fieldType: FieldType,
): fieldType is CompositeTypeNonFilterableWithAny => {
  return COMPOSITE_TYPES_NON_FILTERABLE_WITH_ANY.includes(fieldType as any);
};
