import { isNull, isNumber } from '@sniptt/guards';

import { FieldMoneyValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldMoneyValue = (
  fieldValue: unknown,
): fieldValue is FieldMoneyValue => isNull(fieldValue) || isNumber(fieldValue);
