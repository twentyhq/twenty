import { FieldType } from '@/settings/data-model/types/FieldType';
import { PickLiteral } from '~/types/PickLiteral';

// TODO: add to future fullstack shared package
export const COMPOSITE_FIELD_TYPES = [
  'CURRENCY',
  'EMAILS',
  'LINKS',
  'ADDRESS',
  'PHONES',
  'FULL_NAME',
  'ACTOR',
] as const;

type CompositeFieldTypeBaseLiteral = (typeof COMPOSITE_FIELD_TYPES)[number];

export type CompositeFieldType = PickLiteral<
  FieldType,
  CompositeFieldTypeBaseLiteral
>;
