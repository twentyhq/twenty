import { YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';
import { useThrottler } from 'src/engine/api/graphql/graphql-config/hooks/use-throttler';
import { MetadataGraphQLApiModule } from 'src/engine/api/graphql/metadata-graphql-api.module';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';

export const metadataModuleFactory = async (
  twentyConfigService: TwentyConfigService,
  exceptionHandlerService: ExceptionHandlerService,
  dataloaderService: DataloaderService,
  cacheStorageService: CacheStorageService,
): Promise<YogaDriverConfig> => {
  const config: YogaDriverConfig = {
    autoSchemaFile: true,
    include: [MetadataGraphQLApiModule],
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'metadata' });
    },
    resolvers: { JSON: GraphQLJSON },
    plugins: [
      useThrottler({
        ttl: twentyConfigService.get('API_RATE_LIMITING_TTL'),
        limit: twentyConfigService.get('API_RATE_LIMITING_LIMIT'),
        identifyFn: (context) => {
          return context.req.user?.id ?? context.req.ip ?? 'anonymous';
        },
      }),
      useGraphQLErrorHandlerHook({
        exceptionHandlerService,
      }),
      useCachedMetadata({
        cacheGetter: cacheStorageService.get.bind(cacheStorageService),
        cacheSetter: cacheStorageService.set.bind(cacheStorageService),
        operationsToCache: ['ObjectMetadataItems'],
      }),
    ],
    path: '/metadata',
    context: () => ({
      loaders: dataloaderService.createLoaders(),
    }),
  };

  if (twentyConfigService.get('NODE_ENV') === NodeEnvironment.development) {
    config.renderGraphiQL = () => {
      return renderApolloPlayground({ path: 'metadata' });
    };
  }

  return config;
};
