import { isArray, isNumber, isObject, isString } from 'class-validator';

import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export function assertFindManyArgs(
  args: unknown,
): asserts args is FindManyResolverArgs {
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
    'first',
    'last',
    'before',
    'after',
    'offset',
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

  if ('first' in args && isDefined(args.first) && !isNumber(args.first)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "first" must be a number',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('last' in args && isDefined(args.last) && !isNumber(args.last)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "last" must be a number',
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

  if (
    'orderBy' in args &&
    isDefined(args.orderBy) &&
    !isEmptyObject(args.orderBy) &&
    !isArray(args.orderBy) &&
    !isObject(args.orderBy)
  ) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "orderBy" must be an array',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('before' in args && isDefined(args.before) && !isString(args.before)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "before" must be a string',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('after' in args && isDefined(args.after) && !isString(args.after)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "after" must be a string',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('offset' in args && isDefined(args.offset) && !isNumber(args.offset)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "offset" must be a number',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
