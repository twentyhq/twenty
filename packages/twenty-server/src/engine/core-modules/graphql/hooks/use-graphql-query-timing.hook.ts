import { Logger } from '@nestjs/common';

import { type Plugin } from '@envelop/core';
import { Kind, type OperationDefinitionNode } from 'graphql';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type GraphQLContext } from 'src/engine/api/graphql/graphql-config/interfaces/graphql-context.interface';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { queryTimingContextStorage } from 'src/engine/core-modules/graphql/storage/query-timing-context.storage';

type GraphQLQueryTimingOptions = {
  featureFlagService: FeatureFlagService;
};

const logger = new Logger('GraphQLQueryTiming');

export const useGraphQLQueryTiming = <PluginContext extends GraphQLContext>(
  options: GraphQLQueryTimingOptions,
): Plugin<PluginContext> => {
  return {
    async onExecute({ args, executeFn, setExecuteFn }) {
      const workspaceId = args.contextValue.req?.workspace?.id;

      if (!workspaceId) {
        return;
      }

      const isEnabled = await options.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_GRAPHQL_QUERY_TIMING_ENABLED,
        workspaceId,
      );

      if (!isEnabled) {
        return;
      }

      const rootOperation = args.document.definitions.find(
        (definition: { kind: string }) =>
          definition.kind === Kind.OPERATION_DEFINITION,
      ) as OperationDefinitionNode | undefined;

      const operationName =
        args.operationName || rootOperation?.name?.value || 'Anonymous';

      const operationType = rootOperation?.operation ?? 'unknown';
      const startTime = performance.now();

      setExecuteFn((executeArgs) =>
        queryTimingContextStorage.run(true, () => executeFn(executeArgs)),
      );

      return {
        onExecuteDone() {
          const durationMs = (performance.now() - startTime).toFixed(2);

          logger.log(
            `[${operationType}] ${operationName} — ${durationMs}ms (workspace: ${workspaceId})`,
          );
        },
      };
    },
  };
};
