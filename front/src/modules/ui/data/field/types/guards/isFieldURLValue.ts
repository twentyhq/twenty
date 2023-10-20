import { isString } from '@sniptt/guards';

import { FieldURLValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldURLValue = (
  fieldValue: unknown,
): fieldValue is FieldURLValue => isString(fieldValue);
