import { inspect } from 'util';

import { coerceArrayFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-array-field-or-throw.util';
import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

export const coerceMultiSelectFieldOrThrow = (
  value: unknown,
  options?: string[],
  fieldName?: string,
) => {
  const parsedValue = coerceArrayFieldOrThrow(value, fieldName);

  if (parsedValue === null) return null;

  if (!parsedValue.every((item) => options?.includes(item as string))) {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for multi select field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_MULTI_SELECT,
    );
  }

  return parsedValue;
};
