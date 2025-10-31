import { inspect } from 'util';

import { coerceTextFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-text-field-or-throw.util';
import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/common-data-coercer.exception';

export const coerceRatingAndSelectFieldOrThrow = (
  value: unknown,
  options?: string[],
  fieldName?: string,
) => {
  const coercedTextValue = coerceTextFieldOrThrow(value, fieldName);

  if (coercedTextValue === null) return null;

  if (!options?.includes(coercedTextValue)) {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_SELECT,
    );
  }

  return value;
};
