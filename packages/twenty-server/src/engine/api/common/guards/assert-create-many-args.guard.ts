import { isBoolean, isObject } from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  type CommonInput,
  type CreateManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';

export function assertCreateManyArgs(
  args: unknown,
): asserts args is CommonInput<CreateManyQueryArgs> {
  if (!isObject(args)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: it must be an object',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const argKeys = Object.keys(args);
  const allowedKeys = new Set(['data', 'upsert', 'selectedFields']);

  for (const key of argKeys) {
    if (!allowedKeys.has(key)) {
      throw new CommonQueryRunnerException(
        `Argument not allowed: ${key}`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  if (!('data' in args) || !Array.isArray(args.data)) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "data" (array)',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (!('selectedFields' in args) || !isObject(args.selectedFields)) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "selectedFields"',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('upsert' in args && isDefined(args.upsert) && !isBoolean(args.upsert)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "upsert" must be a boolean',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
