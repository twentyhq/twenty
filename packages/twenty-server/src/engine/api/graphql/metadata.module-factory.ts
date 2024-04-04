import { YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { useExceptionHandler } from 'src/engine/integrations/exception-handler/hooks/use-exception-handler.hook';
import { useThrottler } from 'src/engine/api/graphql/graphql-config/hooks/use-throttler';
import { MetadataGraphQLApiModule } from 'src/engine/api/graphql/metadata-graphql-api.module';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';
import { testMetadataSchema } from 'src/engine/utils/testMetadataSchema';

export const metadataModuleFactory = async (
  environmentService: EnvironmentService,
  exceptionHandlerService: ExceptionHandlerService,
): Promise<YogaDriverConfig> => {
  const isTestEnv = environmentService.get('ENV') === 'test';

  const config: YogaDriverConfig = {
    autoSchemaFile: !isTestEnv,
    schema: isTestEnv ? testMetadataSchema : undefined,
    include: [MetadataGraphQLApiModule],
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'metadata' });
    },
    resolvers: { JSON: GraphQLJSON },
    plugins: [
      useThrottler({
        ttl: environmentService.get('API_RATE_LIMITING_TTL'),
        limit: environmentService.get('API_RATE_LIMITING_LIMIT'),
        identifyFn: (context) => {
          return context.req.user?.id ?? context.req.ip ?? 'anonymous';
        },
      }),
      useExceptionHandler({
        exceptionHandlerService,
      }),
    ],
    path: '/metadata',
  };

  if (environmentService.get('DEBUG_MODE')) {
    config.renderGraphiQL = () => {
      return renderApolloPlayground({ path: 'metadata' });
    };
  }

  return config;
};
