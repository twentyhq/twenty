import { isNull, isString } from '@sniptt/guards';

import { FieldDateValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldDateValue = (
  fieldValue: unknown,
): fieldValue is FieldDateValue => isNull(fieldValue) || isString(fieldValue);
