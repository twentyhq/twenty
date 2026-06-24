import { isObject } from 'class-validator';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { isEmptyGraphqlFilter } from 'src/engine/api/common/common-query-runners/utils/is-empty-graphql-filter.util';
import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import { type DestroyManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export function assertDestroyManyArgs(
  args: unknown,
): asserts args is DestroyManyResolverArgs {
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

  if (!('filter' in args) || !isObject(args.filter)) {
    throw new GraphqlDirectExecutionException(
      'Missing required argument: "filter" (object)',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  // Reject empty/logically-trivial filters to avoid hard-deleting all records.
  if (isEmptyGraphqlFilter(args.filter)) {
    throw new GraphqlDirectExecutionException(
      'A non-empty filter is required for bulk destroy',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
