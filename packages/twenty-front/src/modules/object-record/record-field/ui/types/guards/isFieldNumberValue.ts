import { isNull, isNumber } from '@sniptt/guards';

import { type FieldNumberValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldNumberValue = (
  fieldValue: unknown,
): fieldValue is FieldNumberValue => isNull(fieldValue) || isNumber(fieldValue);
