import { FULL_NAME_DEFAULT_SORT_SUB_FIELD } from '@/object-metadata/constants/FullNameDefaultSortSubField';
import { type AllowedFullNameSubField } from 'twenty-shared/types';

export const getDefaultSortSubFieldForFullName = (): AllowedFullNameSubField =>
  FULL_NAME_DEFAULT_SORT_SUB_FIELD;
