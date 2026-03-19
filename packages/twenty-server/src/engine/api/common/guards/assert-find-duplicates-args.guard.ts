import { isObject } from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  type CommonInput,
  type FindDuplicatesQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';

export function assertFindDuplicatesArgs(
  args: unknown,
): asserts args is CommonInput<FindDuplicatesQueryArgs> {
  if (!isObject(args)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: it must be an object',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const argKeys = Object.keys(args);

  const allowedKeys = new Set(['data', 'ids', 'selectedFields']);

  for (const key of argKeys) {
    if (!allowedKeys.has(key)) {
      throw new CommonQueryRunnerException(
        `Argument not allowed: ${key}`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  if (!('selectedFields' in args) || !isObject(args.selectedFields)) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "selectedFields"',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('data' in args && isDefined(args.data) && !Array.isArray(args.data)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "data" must be an array',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('ids' in args && isDefined(args.ids) && !Array.isArray(args.ids)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "ids" must be an array',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
