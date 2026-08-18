import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { DocumentNode, parse, type GraphQLSchema } from 'graphql';
import { type Plugin } from 'graphql-yoga';

import { isNull } from '@sniptt/guards';
import { DIRECT_EXECUTION_ERROR_SUB_CODES } from 'src/engine/api/graphql/direct-execution/constants/direct-execution-error-sub-codes.constant';
import { type DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { buildCoreRootFieldNames } from 'src/engine/api/graphql/direct-execution/utils/build-core-root-field-names.util';
import { classifyTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/classify-top-level-fields.util';
import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';
import { isSubscriptionOperation } from 'src/engine/api/graphql/direct-execution/utils/is-subscription-operation.util';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  AuthenticationError,
  type BaseGraphQLError,
  InternalServerError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type DirectExecutionPluginConfig = {
  directExecutionService: DirectExecutionService;
  featureFlagService: FeatureFlagService;
};

const NO_WORKSPACE_RESOLVER_NAMES = new Set<string>();

const respondWithError = (error: BaseGraphQLError) =>
  Response.json({ errors: [error.toJSON()] });

export function useDirectExecution(
  config: DirectExecutionPluginConfig,
): Plugin {
  // Root field names of the statically built core schema. Anything outside of
  // it can only be served by direct execution, so a request reaching Yoga with
  // such a field would be validated against a schema that cannot describe it.
  let coreRootFieldNames = new Set<string>();

  const getNonCoreFieldNames = (
    document: DocumentNode,
    operationName: string | undefined,
  ) =>
    classifyTopLevelFields(
      document,
      operationName,
      NO_WORKSPACE_RESOLVER_NAMES,
      coreRootFieldNames,
    ).unknownFieldNames;

  return {
    onSchemaChange: ({ schema }: { schema: GraphQLSchema }) => {
      coreRootFieldNames = buildCoreRootFieldNames(schema);
    },
    onRequest: async ({ endResponse, serverContext }) => {
      const req = (serverContext as unknown as { req: Request }).req;

      if (!req.body?.query) {
        return;
      }

      const queryString = req.body.query as string;
      const operationName = req.body.operationName as string | undefined;

      let document: DocumentNode;
      try {
        document = parse(queryString);
      } catch {
        return;
      }

      const operationDefinition = findOperationDefinition(
        document,
        operationName,
      );

      if (
        !operationDefinition ||
        isSubscriptionOperation(document, operationName)
      ) {
        return;
      }

      if (!req.workspace?.id) {
        const nonCoreFieldNames = getNonCoreFieldNames(document, operationName);

        if (nonCoreFieldNames.length === 0) {
          return;
        }

        // Letting this through would validate a workspace query against the
        // core schema and answer "Cannot query field" instead of telling the
        // client its session is missing or expired.
        return endResponse(
          respondWithError(
            new AuthenticationError(
              `Unauthenticated: no workspace resolved for fields ${nonCoreFieldNames.join(', ')}`,
              {
                subCode:
                  DIRECT_EXECUTION_ERROR_SUB_CODES.WORKSPACE_QUERY_WITHOUT_WORKSPACE,
              },
            ),
          ),
        );
      }

      const workspaceResolverNames =
        await config.directExecutionService.getWorkspaceResolverNames(
          req.workspace.id,
        );

      if (!workspaceResolverNames || workspaceResolverNames.size === 0) {
        const nonCoreFieldNames = getNonCoreFieldNames(document, operationName);

        if (nonCoreFieldNames.length === 0) {
          return;
        }

        // The resolver map is never legitimately empty for an existing
        // workspace: the cache is unavailable, and reporting the fields as
        // unknown would turn a retryable outage into a permanent client error.
        if (Sentry.isInitialized()) {
          Sentry.captureException(
            new Error('Workspace GraphQL resolver map is empty'),
            {
              tags: {
                workspaceId: req.workspace.id,
                subCode:
                  DIRECT_EXECUTION_ERROR_SUB_CODES.WORKSPACE_SCHEMA_UNAVAILABLE,
              },
            },
          );
        }

        return endResponse(
          respondWithError(
            new InternalServerError(
              `Workspace schema unavailable for workspace ${req.workspace.id}`,
              {
                subCode:
                  DIRECT_EXECUTION_ERROR_SUB_CODES.WORKSPACE_SCHEMA_UNAVAILABLE,
              },
            ),
          ),
        );
      }

      const {
        hasIntrospectionFields,
        hasWorkspaceFields,
        hasCoreFields,
        unknownFieldNames,
      } = classifyTopLevelFields(
        document,
        operationName,
        workspaceResolverNames,
        coreRootFieldNames,
      );

      if (unknownFieldNames.length > 0) {
        return endResponse(
          respondWithError(
            new UserInputError(
              `Unknown field${unknownFieldNames.length > 1 ? 's' : ''} ${unknownFieldNames.join(', ')}. The corresponding object may have been deleted or renamed.`,
              {
                subCode: DIRECT_EXECUTION_ERROR_SUB_CODES.UNKNOWN_ROOT_FIELD,
              },
            ),
          ),
        );
      }

      if (hasCoreFields && hasWorkspaceFields) {
        return endResponse(
          respondWithError(
            new UserInputError(
              'This query cannot be executed as a single request. Please split it into separate queries.',
              {
                subCode:
                  DIRECT_EXECUTION_ERROR_SUB_CODES.MIXED_CORE_AND_WORKSPACE_FIELDS,
              },
            ),
          ),
        );
      }

      if (hasCoreFields) {
        return;
      }

      if (Sentry.isInitialized()) {
        const transactionName =
          operationName || operationDefinition.name?.value || '';

        Sentry.setTags({
          operationName: transactionName,
          operation: operationDefinition.operation,
        });
        Sentry.getCurrentScope().setTransactionName(transactionName);
      }

      const result = await config.directExecutionService.execute(
        req,
        document,
        hasIntrospectionFields,
        hasWorkspaceFields,
      );

      if (isNull(result)) {
        return;
      }

      return endResponse(Response.json(result));
    },
  };
}
