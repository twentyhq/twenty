import { isNull, isString } from '@sniptt/guards';

import { formatToHumanReadableDate } from '~/utils';

import { FieldDateValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldDateValue = (
  fieldValue: unknown,
): fieldValue is FieldDateValue => {
  try {
    if (isNull(fieldValue)) return true;
    if (isString(fieldValue)) {
      formatToHumanReadableDate(fieldValue);
      return true;
    }
  } catch {}

  return false;
};
