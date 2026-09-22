import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';

import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';

export const normalizeExactEmailsFilterValue = ({
  operator,
  fieldMetadataType,
  subFieldKey,
  value,
}: {
  operator: string;
  fieldMetadataType: FieldMetadataType;
  subFieldKey?: string;
  value: unknown;
}): unknown => {
  if (
    (operator !== 'eq' && operator !== 'neq' && operator !== 'in') ||
    fieldMetadataType !== FieldMetadataType.EMAILS ||
    subFieldKey !== 'primaryEmail'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((email) =>
      isNonEmptyString(email) ? normalizeEmailAddress(email) : email,
    );
  }

  return isNonEmptyString(value) ? normalizeEmailAddress(value) : value;
};
