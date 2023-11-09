import { isBoolean } from '@sniptt/guards';

import { FieldBooleanValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldBooleanValue = (
  fieldValue: unknown,
): fieldValue is FieldBooleanValue => isBoolean(fieldValue);
