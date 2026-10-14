import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { DocumentNode, parse } from 'graphql';
import { type Plugin } from 'graphql-yoga';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  type DirectExecutionResult,
  type DirectExecutionService,
} from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { classifyTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/classify-top-level-fields.util';
import { captureExecutedRootResolvers } from 'src/engine/api/graphql/utils/capture-executed-root-resolvers.util';
import { extractTopLevelFieldsSafely } from 'src/engine/api/graphql/utils/extract-top-level-fields-safely.util';
import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';
import { isDevelopmentToolingRequest } from 'src/engine/api/graphql/direct-execution/utils/is-development-tooling-request.util';
import { isSubscriptionOperation } from 'src/engine/api/graphql/direct-execution/utils/is-subscription-operation.util';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import {
  AuthenticationError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type DirectExecutionPluginConfig = {
  directExecutionService: DirectExecutionService;
  featureFlagService: FeatureFlagService;
  isProductionEnvironment: boolean;
};

export function useDirectExecution(
  config: DirectExecutionPluginConfig,
): Plugin {
  return {
    onRequest: async ({ endResponse, serverContext }) => {
      const req = (serverContext as unknown as { req: Request }).req;

      if (!isDefined(req.workspace)) {
        if (
          !config.isProductionEnvironment &&
          isDevelopmentToolingRequest(req)
        ) {
          return;
        }

        const result: DirectExecutionResult = {
          errors: [
            new AuthenticationError('Authentication required', {
              subCode: AuthExceptionCode.UNAUTHENTICATED,
              userFriendlyMessage: msg`You must be authenticated to perform this action.`,
            }).toJSON(),
          ],
        };

        config.directExecutionService.recordOperationMetrics(result);

        return endResponse(Response.json(result));
      }

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

      const topLevelFields = extractTopLevelFieldsSafely(
        document,
        operationName,
      );

      captureExecutedRootResolvers({ request: req, topLevelFields });

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

      const workspaceResolverNames =
        await config.directExecutionService.getWorkspaceResolverNames(
          req.workspace.id,
        );

      if (!workspaceResolverNames) {
        return;
      }

      const { hasIntrospectionFields, hasWorkspaceFields, hasCoreFields } =
        classifyTopLevelFields(topLevelFields, workspaceResolverNames);

      if (hasCoreFields && hasWorkspaceFields) {
        const error = new UserInputError(
          'This query cannot be executed as a single request. Please split it into separate queries.',
        );

        const result = { errors: [error.toJSON()] };

        config.directExecutionService.recordOperationMetrics(result);

        return endResponse(Response.json(result));
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

      config.directExecutionService.recordOperationMetrics(result);

      return endResponse(Response.json(result));
    },
  };
}
