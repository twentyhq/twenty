import { isArray, isNumber, isObject, isString } from 'class-validator';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  type CommonInput,
  type FindManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { isDefined } from 'twenty-shared/utils';

export function assertFindManyArgs(
  args: unknown,
): asserts args is CommonInput<FindManyQueryArgs> {
  if (!isObject(args)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: it must be an object',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const argKeys = Object.keys(args);

  const allowedKeys = new Set([
    'filter',
    'orderBy',
    'first',
    'last',
    'before',
    'after',
    'offset',
    'selectedFields',
  ]);

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

  if ('first' in args && isDefined(args.first) && !isNumber(args.first)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "first" must be a number',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('last' in args && isDefined(args.last) && !isNumber(args.last)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "last" must be a number',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('filter' in args && isDefined(args.filter) && !isObject(args.filter)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "filter" must be an object',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('orderBy' in args && isDefined(args.orderBy) && !isArray(args.orderBy)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "orderBy" must be an array',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('before' in args && isDefined(args.before) && !isString(args.before)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "before" must be a string',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('after' in args && isDefined(args.after) && !isString(args.after)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "after" must be a string',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('offset' in args && isDefined(args.offset) && !isNumber(args.offset)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "offset" must be a number',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
