import { isNull, isString } from '@sniptt/guards';

import { FieldDateValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldDateValue = (
  fieldValue: unknown,
): fieldValue is FieldDateValue => isNull(fieldValue) || isString(fieldValue);
