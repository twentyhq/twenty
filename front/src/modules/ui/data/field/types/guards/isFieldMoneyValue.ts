import { isNull, isNumber } from '@sniptt/guards';

import { FieldMoneyValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldMoneyValue = (
  fieldValue: unknown,
): fieldValue is FieldMoneyValue => isNull(fieldValue) || isNumber(fieldValue);
