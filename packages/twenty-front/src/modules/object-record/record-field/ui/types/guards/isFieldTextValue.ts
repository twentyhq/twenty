import { isString } from '@sniptt/guards';

import { type FieldTextValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldTextValue = (
  fieldValue: unknown,
): fieldValue is FieldTextValue => isString(fieldValue);
