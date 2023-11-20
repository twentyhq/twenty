import { isDate } from '@sniptt/guards';

import { FieldDateTimeValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldDateTimeValue = (
  fieldValue: unknown,
): fieldValue is FieldDateTimeValue => isDate(fieldValue);
