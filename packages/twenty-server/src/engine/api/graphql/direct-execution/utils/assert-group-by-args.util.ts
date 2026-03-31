import {
  isArray,
  isBoolean,
  isNumber,
  isObject,
  isString,
} from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export function assertGroupByArgs(
  args: unknown,
): asserts args is GroupByResolverArgs {
  if (!isObject(args)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: it must be an object',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
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
    'limit',
    'offsetForRecords',
  ]);

  for (const key of argKeys) {
    if (!allowedKeys.has(key)) {
      throw new GraphqlDirectExecutionException(
        `Argument not allowed: ${key}`,
        GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  if (
    !('groupBy' in args) ||
    (!Array.isArray(args.groupBy) && !isObject(args.groupBy))
  ) {
    throw new GraphqlDirectExecutionException(
      'Missing required argument: "groupBy" must be an array.',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('filter' in args && isDefined(args.filter) && !isObject(args.filter)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "filter" must be an object',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('orderBy' in args && isDefined(args.orderBy) && !isArray(args.orderBy)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "orderBy" must be an array',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    'orderByForRecords' in args &&
    isDefined(args.orderByForRecords) &&
    !isArray(args.orderByForRecords)
  ) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "orderByForRecords" must be an array',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('viewId' in args && isDefined(args.viewId) && !isString(args.viewId)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "viewId" must be a string',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    'includeRecords' in args &&
    isDefined(args.includeRecords) &&
    !isBoolean(args.includeRecords)
  ) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "includeRecords" must be a boolean',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('limit' in args && isDefined(args.limit) && !isNumber(args.limit)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "limit" must be a number',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    'offsetForRecords' in args &&
    isDefined(args.offsetForRecords) &&
    !isNumber(args.offsetForRecords)
  ) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "offsetForRecords" must be a number',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
