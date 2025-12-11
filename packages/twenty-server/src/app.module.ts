import {
  type DynamicModule,
  type MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';

import { existsSync } from 'fs';
import { join } from 'path';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { SentryModule } from '@sentry/nestjs/setup';

import { CoreGraphQLApiModule } from 'src/engine/api/graphql/core-graphql-api.module';
import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { GraphQLConfigService } from 'src/engine/api/graphql/graphql-config/graphql-config.service';
import { MetadataGraphQLApiModule } from 'src/engine/api/graphql/metadata-graphql-api.module';
import { McpModule } from 'src/engine/api/mcp/mcp.module';
import { RestApiModule } from 'src/engine/api/rest/rest-api.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { DataloaderModule } from 'src/engine/dataloaders/dataloader.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { GraphQLHydrateRequestFromTokenMiddleware } from 'src/engine/middlewares/graphql-hydrate-request-from-token.middleware';
import { MiddlewareModule } from 'src/engine/middlewares/middleware.module';
import { RestCoreMiddleware } from 'src/engine/middlewares/rest-core.middleware';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { ModulesModule } from 'src/modules/modules.module';

import { ClickHouseModule } from './database/clickHouse/clickHouse.module';
import { CoreEngineModule } from './engine/core-modules/core-engine.module';
import { I18nModule } from './engine/core-modules/i18n/i18n.module';

// TODO: Remove this middleware when all the rest endpoints are migrated to TwentyORM
const MIGRATED_REST_METHODS = [
  RequestMethod.DELETE,
  RequestMethod.POST,
  RequestMethod.PATCH,
  RequestMethod.PUT,
  RequestMethod.GET,
];

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [GraphQLConfigModule, MetricsModule, DataloaderModule],
      useClass: GraphQLConfigService,
    }),
    TwentyORMModule,
    GlobalWorkspaceDataSourceModule,
    ClickHouseModule,
    // Core engine module, contains all the core modules
    CoreEngineModule,
    // Modules module, contains all business logic modules
    ModulesModule,
    // Needed for the user workspace middleware
    WorkspaceCacheStorageModule,
    // Api modules
    CoreGraphQLApiModule,
    MetadataGraphQLApiModule,
    RestApiModule,
    McpModule,
    DataSourceModule,
    MiddlewareModule,
    WorkspaceMetadataVersionModule,
    // I18n module for translations
    I18nModule,
    // Conditional modules
    ...AppModule.getConditionalModules(),
  ],
})
export class AppModule {
  private static getConditionalModules(): DynamicModule[] {
    const modules: DynamicModule[] = [];
    const frontPath = join(__dirname, 'front');

    // NestJS DevTools - can be useful for debugging and profiling
    /* if (process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT) {
      modules.push(
        DevtoolsModule.register({
          http: true,
        }),
      );
    } */

    if (existsSync(frontPath)) {
      modules.push(
        ServeStaticModule.forRoot({
          rootPath: frontPath,
        }),
      );
    }

    // Messaque Queue explorer only for sync driver
    // Maybe we don't need to conditionaly register the explorer, because we're creating a jobs module
    // that will expose classes that are only used in the queue worker
    /*
    if (process.env.MESSAGE_QUEUE_TYPE === MessageQueueDriverType.Sync) {
      modules.push(MessageQueueModule.registerExplorer());
    }
    */

    return modules;
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GraphQLHydrateRequestFromTokenMiddleware)
      .forRoutes({ path: 'graphql', method: RequestMethod.ALL });

    consumer
      .apply(GraphQLHydrateRequestFromTokenMiddleware)
      .forRoutes({ path: 'metadata', method: RequestMethod.ALL });

    for (const method of MIGRATED_REST_METHODS) {
      consumer
        .apply(RestCoreMiddleware)
        .forRoutes({ path: 'rest/*path', method });
    }
  }
}
