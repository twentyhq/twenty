import { type DocumentNode, Kind } from 'graphql';
import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { type Plugin } from 'graphql-yoga';

import { captureExecutedRootResolvers } from 'src/engine/api/graphql/utils/capture-executed-root-resolvers.util';
import { extractTopLevelFieldsSafely } from 'src/engine/api/graphql/utils/extract-top-level-fields-safely.util';
import {
  type GraphqlQueryComplexityLimits,
  validateGraphqlQueryComplexityOrThrow,
} from 'src/engine/core-modules/graphql/utils/validate-graphql-query-complexity-or-throw.util';

export const useValidateGraphqlQueryComplexity = (
  limits: GraphqlQueryComplexityLimits,
): Plugin => ({
  onParse: ({ context }) => {
    return ({ result }) => {
      if (!result || !('kind' in result) || result.kind !== Kind.DOCUMENT) {
        return;
      }

      const document = result as DocumentNode;

      captureExecutedRootResolvers({
        request: extractRequest(context),
        topLevelFields: extractTopLevelFieldsSafely(
          document,
          extractOperationName(context),
        ),
      });

      validateGraphqlQueryComplexityOrThrow(document, limits);
    };
  },
});

const extractRequest = (context: unknown): Request | undefined =>
  (context as { req?: Request } | undefined)?.req;

const extractOperationName = (context: unknown): string | undefined => {
  const typedContext = context as
    | {
        params?: { operationName?: unknown };
        req?: { body?: { operationName?: unknown } };
      }
    | undefined;

  const fromParams = typedContext?.params?.operationName;

  if (isNonEmptyString(fromParams)) {
    return fromParams;
  }

  const fromBody = typedContext?.req?.body?.operationName;

  return isNonEmptyString(fromBody) ? fromBody : undefined;
};
