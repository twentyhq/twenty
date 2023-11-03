import { isString } from '@sniptt/guards';

import { FieldEmailValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldEmailValue = (
  fieldValue: unknown,
): fieldValue is FieldEmailValue => isString(fieldValue);
