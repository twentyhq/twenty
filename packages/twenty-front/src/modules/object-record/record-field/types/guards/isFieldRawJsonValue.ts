import { isString } from '@sniptt/guards';

import { FieldJsonValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldRawJsonValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue => isString(fieldValue);
