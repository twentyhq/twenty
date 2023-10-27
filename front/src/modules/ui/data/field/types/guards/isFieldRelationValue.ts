import { isNull, isObject, isUndefined } from '@sniptt/guards';

import { FieldRelationValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldRelationValue = (
  fieldValue: unknown,
): fieldValue is FieldRelationValue =>
  !isUndefined(fieldValue) && (isObject(fieldValue) || isNull(fieldValue));
