import { type YogaDriverConfig } from '@graphql-yoga/nestjs';
import * as Sentry from '@sentry/node';
import GraphQLJSON from 'graphql-type-json';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';
import { getFindAllViewsCacheTtl } from 'src/engine/api/graphql/graphql-config/utils/get-find-all-views-cache-ttl.util';
import { MetadataGraphQLApiModule } from 'src/engine/api/graphql/metadata-graphql-api.module';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { ClientConfig } from 'src/engine/core-modules/client-config/client-config.entity';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { useSentryTracing } from 'src/engine/core-modules/exception-handler/hooks/use-sentry-tracing';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { useDisableIntrospectionAndSuggestionsForUnauthenticatedUsers } from 'src/engine/core-modules/graphql/hooks/use-disable-introspection-and-suggestions-for-unauthenticated-users.hook';
import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { useValidateGraphqlQueryComplexity } from 'src/engine/core-modules/graphql/hooks/use-validate-graphql-query-complexity.hook';
import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';
import { type FindAllViewsCacheService } from 'src/engine/workspace-cache-storage/services/find-all-views-cache.service';

export const metadataModuleFactory = async (
  twentyConfigService: TwentyConfigService,
  exceptionHandlerService: ExceptionHandlerService,
  dataloaderService: DataloaderService,
  cacheStorageService: CacheStorageService,
  findAllViewsCacheService: FindAllViewsCacheService,
  metricsService: MetricsService,
  i18nService: I18nService,
  _featureFlagService: FeatureFlagService,
): Promise<YogaDriverConfig> => {
  const cacheStorageTtlMilliseconds =
    twentyConfigService.get('CACHE_STORAGE_TTL') * 1000;
  const findAllViewsCacheTtlMilliseconds = getFindAllViewsCacheTtl(
    cacheStorageTtlMilliseconds,
  );
  const config: YogaDriverConfig = {
    autoSchemaFile: true,
    include: [MetadataGraphQLApiModule],
    resolverSchemaScope: 'metadata',
    buildSchemaOptions: {
      orphanedTypes: [ClientConfig],
    },
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'metadata' });
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
      useCachedMetadata({
        cacheGetter: cacheStorageService.get.bind(cacheStorageService),
        cacheSetterIfAbsent: (key, value, ttlMilliseconds) =>
          cacheStorageService.setIfAbsent(
            key,
            value,
            ttlMilliseconds ?? cacheStorageTtlMilliseconds,
          ),
        cacheKeySalt: twentyConfigService.get('APP_VERSION') ?? 'development',
        operationConfigs: {
          ObjectMetadataItems: {
            variesByLocale: true,
          },
          FindAllViews: {
            cacheGenerationGetter: (workspaceId) =>
              findAllViewsCacheService.getCacheGeneration(workspaceId),
            cacheTtlMilliseconds: findAllViewsCacheTtlMilliseconds,
            variesByLocale: true,
            variesByUserWorkspace: true,
          },
        },
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
    path: '/metadata',
    context: () => ({
      loaders: dataloaderService.createLoaders(),
    }),
  };

  if (twentyConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT) {
    config.renderGraphiQL = () => {
      return renderApolloPlayground({ path: 'metadata' });
    };
  }

  return config;
};
