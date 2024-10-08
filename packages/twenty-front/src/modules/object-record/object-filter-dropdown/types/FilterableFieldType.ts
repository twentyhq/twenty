import { FieldType } from '@/settings/data-model/types/FieldType';
import { PickLiteral } from '~/types/PickLiteral';

export type FilterableFieldType = PickLiteral<
  FieldType,
  | 'TEXT'
  | 'PHONE'
  | 'PHONES'
  | 'EMAIL'
  | 'EMAILS'
  | 'DATE_TIME'
  | 'DATE'
  | 'NUMBER'
  | 'CURRENCY'
  | 'FULL_NAME'
  | 'LINK'
  | 'LINKS'
  | 'RELATION'
  | 'ADDRESS'
  | 'SELECT'
  | 'RATING'
  | 'MULTI_SELECT'
  | 'ACTOR'
  | 'ARRAY'
>;
