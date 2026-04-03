import { isObject } from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import { type FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export function assertFindOneArgs(
  args: unknown,
): asserts args is FindOneResolverArgs {
  if (!isObject(args)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: it must be an object',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const argKeys = Object.keys(args);

  const allowedKeys = new Set(['filter']);

  for (const key of argKeys) {
    if (!allowedKeys.has(key)) {
      throw new GraphqlDirectExecutionException(
        `Argument not allowed: ${key}`,
        GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  if ('filter' in args && isDefined(args.filter) && !isObject(args.filter)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "filter" must be an object',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
