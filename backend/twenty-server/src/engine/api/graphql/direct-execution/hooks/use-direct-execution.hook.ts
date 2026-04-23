import { Logger } from '@nestjs/common';

import { type Request } from 'express';
import { DocumentNode, parse } from 'graphql';
import { type Plugin } from 'graphql-yoga';
import { FeatureFlagKey } from 'twenty-shared/types';

import { isNull } from '@sniptt/guards';
import { type DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { queryTimingContextStorage } from 'src/engine/core-modules/graphql/storage/query-timing-context.storage';
import { computeSkipWorkspaceSchemaCreation } from 'src/engine/api/graphql/direct-execution/utils/compute-skip-workspace-schema-creation.util';
import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';
import { hasOnlyGeneratedWorkspaceResolvers } from 'src/engine/api/graphql/direct-execution/utils/has-only-generated-workspace-resolvers.util';
import { isSubscriptionOperation } from 'src/engine/api/graphql/direct-execution/utils/is-subscription-operation.util';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

const logger = new Logger('GraphQLQueryTiming');

export type DirectExecutionPluginConfig = {
  directExecutionService: DirectExecutionService;
  featureFlagService: FeatureFlagService;
};

export function useDirectExecution(
  config: DirectExecutionPluginConfig,
): Plugin {
  return {
    onRequest: async ({ endResponse, serverContext }) => {
      const req = (serverContext as unknown as { req: Request }).req;

      if (!req.workspace?.id || !req.body?.query) {
        return;
      }

      const isDirectExecutionEnabled =
        await config.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_DIRECT_GRAPHQL_EXECUTION_ENABLED,
          req.workspace.id,
        );

      if (!isDirectExecutionEnabled) {
        return;
      }

      const generatedWorkspaceResolverNames =
        await config.directExecutionService.getGeneratedWorkspaceResolverNames(
          req.workspace.id,
        );

      if (!generatedWorkspaceResolverNames) {
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

      if (
        !findOperationDefinition(document, operationName) ||
        isSubscriptionOperation(document, operationName)
      ) {
        return;
      }

      if (
        computeSkipWorkspaceSchemaCreation(
          queryString,
          document,
          operationName,
          generatedWorkspaceResolverNames,
        )
      ) {
        req.skipWorkspaceSchemaCreation = true;
      }

      if (
        !hasOnlyGeneratedWorkspaceResolvers(
          document,
          operationName,
          generatedWorkspaceResolverNames,
        )
      ) {
        return;
      }

      const isTimingEnabled = await config.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_GRAPHQL_QUERY_TIMING_ENABLED,
        req.workspace.id,
      );

      const resolvedOperationName = operationName ?? 'Anonymous';

      if (isTimingEnabled) {
        const startTime = performance.now();

        const timedResult = await queryTimingContextStorage.run(true, () =>
          config.directExecutionService.execute(req, document),
        );

        const durationMs = (performance.now() - startTime).toFixed(2);

        logger.log(
          `[direct-execution] ${resolvedOperationName} — ${durationMs}ms (workspace: ${req.workspace.id})`,
        );

        if (isNull(timedResult)) {
          return;
        }

        return endResponse(Response.json(timedResult));
      }

      const result = await config.directExecutionService.execute(req, document);

      if (isNull(result)) {
        return;
      }

      return endResponse(Response.json(result));
    },
  };
}
