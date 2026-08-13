import {
  type DynamicModule,
  type MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';

import { existsSync } from 'fs';
import { join } from 'path';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { SentryModule } from '@sentry/nestjs/setup';
import { ApiPath } from 'twenty-shared/types';

import { AdminPanelGraphQLApiModule } from 'src/engine/api/graphql/admin-panel-graphql-api.module';
import { CoreGraphQLApiModule } from 'src/engine/api/graphql/core-graphql-api.module';
import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { GraphQLConfigService } from 'src/engine/api/graphql/graphql-config/graphql-config.service';
import { MetadataGraphQLApiModule } from 'src/engine/api/graphql/metadata-graphql-api.module';
import { McpMethodGuardMiddleware } from 'src/engine/api/mcp/middlewares/mcp-method-guard.middleware';
import { McpModule } from 'src/engine/api/mcp/mcp.module';
import { RestApiModule } from 'src/engine/api/rest/rest-api.module';
import { WorkspaceAuthContextMiddleware } from 'src/engine/core-modules/auth/middlewares/workspace-auth-context.middleware';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { DataloaderModule } from 'src/engine/dataloaders/dataloader.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { CookieSessionCsrfMiddleware } from 'src/engine/middlewares/cookie-session-csrf.middleware';
import { GraphQLHydrateRequestFromTokenMiddleware } from 'src/engine/middlewares/graphql-hydrate-request-from-token.middleware';
import { MiddlewareModule } from 'src/engine/middlewares/middleware.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { RestCoreMiddleware } from 'src/engine/middlewares/rest-core.middleware';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';
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
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [GraphQLConfigModule, MetricsModule, DataloaderModule],
      useClass: GraphQLConfigService,
    }),
    TwentyORMModule,
    GlobalWorkspaceDataSourceModule,
    ClickHouseModule,
    CoreEngineModule,
    ModulesModule,
    // Needed for the user workspace middleware
    WorkspaceCacheStorageModule,
    CoreGraphQLApiModule,
    MetadataGraphQLApiModule,
    AdminPanelGraphQLApiModule,
    RestApiModule,
    McpModule,
    MiddlewareModule,
    JwtModule,
    UserSessionModule,
    WorkspaceMetadataVersionModule,
    I18nModule,
    ...AppModule.getConditionalModules(),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionFilter,
    },
  ],
})
export class AppModule {
  private static getConditionalModules(): DynamicModule[] {
    const modules: DynamicModule[] = [];
    const frontPath = join(__dirname, 'front');

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

    return modules;
  }

  configure(consumer: MiddlewareConsumer) {
    // Before any middleware that authenticates from the session cookie.
    consumer
      .apply(CookieSessionCsrfMiddleware)
      // A cross-origin form post from the identity provider, authenticated on the
      // assertion rather than the cookie.
      .exclude({
        path: `${ApiPath.Auth}/saml/callback/:identityProviderId`,
        method: RequestMethod.POST,
      })
      .forRoutes({ path: '*path', method: RequestMethod.ALL });

    consumer
      .apply(
        GraphQLHydrateRequestFromTokenMiddleware,
        WorkspaceAuthContextMiddleware,
      )
      .forRoutes({ path: ApiPath.GraphQL, method: RequestMethod.ALL });

    consumer
      .apply(
        GraphQLHydrateRequestFromTokenMiddleware,
        WorkspaceAuthContextMiddleware,
      )
      .forRoutes({ path: ApiPath.Metadata, method: RequestMethod.ALL });

    consumer
      .apply(
        GraphQLHydrateRequestFromTokenMiddleware,
        WorkspaceAuthContextMiddleware,
      )
      .forRoutes({ path: ApiPath.AdminPanel, method: RequestMethod.ALL });

    consumer
      .apply(McpMethodGuardMiddleware)
      .forRoutes({ path: ApiPath.Mcp, method: RequestMethod.ALL });

    for (const method of MIGRATED_REST_METHODS) {
      consumer
        .apply(RestCoreMiddleware, WorkspaceAuthContextMiddleware)
        .forRoutes({ path: `${ApiPath.Rest}/*path`, method });
    }
  }
}
