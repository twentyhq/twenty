import { type Request } from 'express';
import { type Plugin } from 'graphql-yoga';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

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

      const isEnabled = await config.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_DIRECT_GRAPHQL_EXECUTION_ENABLED,
        req.workspace.id,
      );

      if (!isEnabled) {
        return;
      }

      // Skip introspection queries - they need the full schema
      const queryString = req.body.query as string;

      if (queryString.includes('__schema') || queryString.includes('__type')) {
        return;
      }

      const result = await config.directExecutionService.execute(req);

      // null = the service couldn't handle this query, fall through
      if (result === null) {
        return;
      }

      return endResponse(Response.json(result));
    },
  };
}
