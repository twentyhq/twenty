import { isString } from '@sniptt/guards';

import { FieldEmailValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldEmailValue = (
  fieldValue: unknown,
): fieldValue is FieldEmailValue => isString(fieldValue);
