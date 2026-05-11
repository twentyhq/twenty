import { FULL_NAME_DEFAULT_SORT_SUB_FIELD } from '@/object-metadata/constants/FullNameDefaultSortSubField';
import { ALLOWED_FULL_NAME_SORT_SUBFIELDS } from 'twenty-shared/constants';
import { type AllowedFullNameSortSubField } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const isAllowedFullNameSortSubField = (
  value: string | null | undefined,
): value is AllowedFullNameSortSubField =>
  ALLOWED_FULL_NAME_SORT_SUBFIELDS.includes(value as AllowedFullNameSortSubField);

export const resolveFullNameSortSubField = (
  requestedSubField?: string | null,
): AllowedFullNameSortSubField => {
  if (
    isDefined(requestedSubField) &&
    isAllowedFullNameSortSubField(requestedSubField)
  ) {
    return requestedSubField;
  }
  return FULL_NAME_DEFAULT_SORT_SUB_FIELD;
};
