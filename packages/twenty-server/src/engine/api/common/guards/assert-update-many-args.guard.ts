import { isObject } from 'class-validator';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  type CommonInput,
  type UpdateManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';

export function assertUpdateManyArgs(
  args: unknown,
): asserts args is CommonInput<UpdateManyQueryArgs> {
  if (!isObject(args)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: it must be an object',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const argKeys = Object.keys(args);

  const allowedKeys = new Set(['filter', 'data', 'selectedFields']);

  for (const key of argKeys) {
    if (!allowedKeys.has(key)) {
      throw new CommonQueryRunnerException(
        `Argument not allowed: ${key}`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  if (!('filter' in args) || !isObject(args.filter)) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "filter" (object)',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (!('data' in args) || !isObject(args.data)) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "data" (object)',
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
}
