import { isBoolean, isObject } from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export function assertCreateManyArgs(
  args: unknown,
): asserts args is CreateManyResolverArgs {
  if (!isObject(args)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: it must be an object',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const argKeys = Object.keys(args);
  const allowedKeys = new Set(['data', 'upsert']);

  for (const key of argKeys) {
    if (!allowedKeys.has(key)) {
      throw new GraphqlDirectExecutionException(
        `Argument not allowed: ${key}`,
        GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  if (!('data' in args) || !Array.isArray(args.data)) {
    throw new GraphqlDirectExecutionException(
      'Missing required argument: "data" (array)',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('upsert' in args && isDefined(args.upsert) && !isBoolean(args.upsert)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "upsert" must be a boolean',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
