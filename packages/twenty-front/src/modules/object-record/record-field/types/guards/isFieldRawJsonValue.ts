import { isNull, isString } from '@sniptt/guards';

import { FieldJsonValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldRawJsonValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue => isString(fieldValue) || isNull(fieldValue);
