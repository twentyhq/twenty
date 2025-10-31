import { isNull } from '@sniptt/guards';

import { coerceNumberFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-number-field-or-throw.util';

//Need to handle stringified numbers because of BigFloatScalarType custom gql type

export const coerceNumericFieldOrThrow = (
  value: unknown,
  fieldName?: string,
): number | null => {
  if (value === '' || isNull(value)) return null;

  const numberValue = Number(String(value));

  coerceNumberFieldOrThrow(numberValue, fieldName);

  return numberValue;
};
