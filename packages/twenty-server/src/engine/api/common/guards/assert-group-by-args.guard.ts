import {
  isArray,
  isBoolean,
  isNumber,
  isObject,
  isString,
} from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  type CommonInput,
  type GroupByQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';

export function assertGroupByArgs(
  args: unknown,
): asserts args is CommonInput<GroupByQueryArgs> {
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
    'orderByForRecords',
    'groupBy',
    'viewId',
    'includeRecords',
    'selectedFields',
    'limit',
    'offsetForRecords',
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

  if (!('groupBy' in args) || !Array.isArray(args.groupBy)) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "groupBy" (array)',
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

  if (
    'orderByForRecords' in args &&
    isDefined(args.orderByForRecords) &&
    !isArray(args.orderByForRecords)
  ) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "orderByForRecords" must be an array',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('viewId' in args && isDefined(args.viewId) && !isString(args.viewId)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "viewId" must be a string',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    'includeRecords' in args &&
    isDefined(args.includeRecords) &&
    !isBoolean(args.includeRecords)
  ) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "includeRecords" must be a boolean',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('limit' in args && isDefined(args.limit) && !isNumber(args.limit)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "limit" must be a number',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    'offsetForRecords' in args &&
    isDefined(args.offsetForRecords) &&
    !isNumber(args.offsetForRecords)
  ) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "offsetForRecords" must be a number',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
