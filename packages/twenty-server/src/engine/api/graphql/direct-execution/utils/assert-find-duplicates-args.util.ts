import { isObject } from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type FindDuplicatesResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export function assertFindDuplicatesArgs(
  args: unknown,
): asserts args is FindDuplicatesResolverArgs {
  if (!isObject(args)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: it must be an object',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const argKeys = Object.keys(args);

  const allowedKeys = new Set(['data', 'ids']);

  for (const key of argKeys) {
    if (!allowedKeys.has(key)) {
      throw new GraphqlDirectExecutionException(
        `Argument not allowed: ${key}`,
        GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  if ('data' in args && isDefined(args.data) && !Array.isArray(args.data)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "data" must be an array',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('ids' in args && isDefined(args.ids) && !Array.isArray(args.ids)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "ids" must be an array',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
