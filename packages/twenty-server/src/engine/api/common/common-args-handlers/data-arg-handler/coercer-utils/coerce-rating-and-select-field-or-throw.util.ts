import { inspect } from 'util';

import { coerceTextFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-text-field-or-throw.util';
import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

export const coerceRatingAndSelectFieldOrThrow = (
  value: unknown,
  options?: string[],
  fieldName?: string,
  isNullEquivalenceEnabled: boolean = false,
) => {
  const coercedTextValue = coerceTextFieldOrThrow(
    value,
    fieldName,
    isNullEquivalenceEnabled,
  );

  if (coercedTextValue === null) return null;

  if (!options?.includes(coercedTextValue)) {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_SELECT,
    );
  }

  return value;
};
