import { isObject, isUndefined } from '@sniptt/guards';

import { FieldRelationValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldRelationValue = (
  fieldValue: unknown,
): fieldValue is FieldRelationValue =>
  !isUndefined(fieldValue) && isObject(fieldValue);
