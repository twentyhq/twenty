import { FULL_NAME_DEFAULT_SORT_SUB_FIELD } from '@/object-metadata/constants/FullNameDefaultSortSubField';
import { ALLOWED_FULL_NAME_SUBFIELDS } from 'twenty-shared/constants';
import { type AllowedFullNameSubField } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const isAllowedFullNameSubField = (
  value: string | null | undefined,
): value is AllowedFullNameSubField =>
  ALLOWED_FULL_NAME_SUBFIELDS.includes(value as AllowedFullNameSubField);

export const resolveFullNameSortSubField = (
  requestedSubField?: string | null,
): AllowedFullNameSubField => {
  if (
    isDefined(requestedSubField) &&
    isAllowedFullNameSubField(requestedSubField)
  ) {
    return requestedSubField;
  }
  return FULL_NAME_DEFAULT_SORT_SUB_FIELD;
};
