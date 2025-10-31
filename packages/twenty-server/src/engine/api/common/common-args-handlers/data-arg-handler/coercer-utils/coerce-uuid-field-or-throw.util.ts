import { inspect } from 'util';

import { isNull } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/common-data-coercer.exception';

export const coerceUUIDFieldOrThrow = (
  value: unknown,
  fieldName?: string,
): string | null => {
  if (!isValidUuid(value as string) && !isNull(value))
    throw new CommonDataCoercerException(
      `Invalid UUID value ${inspect(value)} for field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_UUID,
    );

  return value as string;
};
