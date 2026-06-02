import { type YogaDriverConfig } from '@graphql-yoga/nestjs';
import * as Sentry from '@sentry/node';
import GraphQLJSON from 'graphql-type-json';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { AdminPanelGraphQLApiModule } from 'src/engine/api/graphql/admin-panel-graphql-api.module';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { useSentryTracing } from 'src/engine/core-modules/exception-handler/hooks/use-sentry-tracing';
import { useDisableIntrospectionAndSuggestionsForUnauthenticatedUsers } from 'src/engine/core-modules/graphql/hooks/use-disable-introspection-and-suggestions-for-unauthenticated-users.hook';
import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { useValidateGraphqlQueryComplexity } from 'src/engine/core-modules/graphql/hooks/use-validate-graphql-query-complexity.hook';
import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';

export const adminPanelModuleFactory = async (
  twentyConfigService: TwentyConfigService,
  exceptionHandlerService: ExceptionHandlerService,
  dataloaderService: DataloaderService,
  metricsService: MetricsService,
  i18nService: I18nService,
): Promise<YogaDriverConfig> => {
  const config: YogaDriverConfig = {
    autoSchemaFile: true,
    include: [AdminPanelGraphQLApiModule],
    resolverSchemaScope: 'admin',
    buildSchemaOptions: {},
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'admin-panel' });
    },
    resolvers: { JSON: GraphQLJSON },
    plugins: [
      ...(Sentry.isInitialized() ? [useSentryTracing()] : []),
      useGraphQLErrorHandlerHook({
        metricsService: metricsService,
        exceptionHandlerService,
        i18nService,
        twentyConfigService,
      }),
      useDisableIntrospectionAndSuggestionsForUnauthenticatedUsers(
        twentyConfigService.get('NODE_ENV') === NodeEnvironment.PRODUCTION,
      ),
      useValidateGraphqlQueryComplexity({
        maximumAllowedFields: twentyConfigService.get('GRAPHQL_MAX_FIELDS'),
        maximumAllowedRootResolvers: 10,
        maximumAllowedNestedFields: 10,
        checkDuplicateRootResolvers: true,
      }),
    ],
    path: '/admin-panel',
    context: () => ({
      loaders: dataloaderService.createLoaders(),
    }),
  };

  if (twentyConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT) {
    config.renderGraphiQL = () => {
      return renderApolloPlayground({ path: 'admin-panel' });
    };
  }

  return config;
};
