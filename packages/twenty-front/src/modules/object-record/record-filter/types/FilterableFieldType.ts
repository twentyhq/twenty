import { FieldType } from '@/settings/data-model/types/FieldType';
import { PickLiteral } from '~/types/PickLiteral';

export type FilterableFieldType = PickLiteral<
  FieldType,
  | 'TEXT'
  | 'PHONES'
  | 'EMAILS'
  | 'DATE_TIME'
  | 'DATE'
  | 'NUMBER'
  | 'CURRENCY'
  | 'FULL_NAME'
  | 'LINKS'
  | 'RELATION'
  | 'ADDRESS'
  | 'SELECT'
  | 'RATING'
  | 'MULTI_SELECT'
  | 'ACTOR'
  | 'ARRAY'
  | 'RAW_JSON'
  | 'BOOLEAN'
>;
