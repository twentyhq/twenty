import { isNull } from '@sniptt/guards';

import { validateNumberFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-number-field-or-throw.util';

//Need to handle stringified numbers because of BigFloatScalarType custom gql type

export const validateNumericFieldOrThrow = (
  value: unknown,
  fieldName: string,
): number | string | null => {
  if (value === '' || isNull(value)) return null;

  const numberValue = Number(value);

  validateNumberFieldOrThrow(numberValue, fieldName);

  return value as number | string;
};
