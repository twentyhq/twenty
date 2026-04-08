import { Injectable } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { type GqlOptionsFactory } from '@nestjs/graphql';

import {
  type YogaDriverConfig,
  type YogaDriverServerContext,
} from '@graphql-yoga/nestjs';
import * as Sentry from '@sentry/node';
import GraphQLJSON from 'graphql-type-json';
import {
  type GraphQLSchemaWithContext,
  type YogaInitialContext,
} from 'graphql-yoga';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { useDirectExecution } from 'src/engine/api/graphql/direct-execution/hooks/use-direct-execution.hook';
import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { type FlatAuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';
import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { useSentryTracing } from 'src/engine/core-modules/exception-handler/hooks/use-sentry-tracing';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { useDisableIntrospectionAndSuggestionsForUnauthenticatedUsers } from 'src/engine/core-modules/graphql/hooks/use-disable-introspection-and-suggestions-for-unauthenticated-users.hook';
import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { useValidateGraphqlQueryComplexity } from 'src/engine/core-modules/graphql/hooks/use-validate-graphql-query-complexity.hook';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: FlatAuthContextUser;
  workspace?: FlatWorkspace;
}

@Injectable()
export class GraphQLConfigService
  implements GqlOptionsFactory<YogaDriverConfig<'express'>>
{
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly moduleRef: ModuleRef,
    private readonly metricsService: MetricsService,
    private readonly dataloaderService: DataloaderService,
    private readonly i18nService: I18nService,
    private readonly directExecutionService: DirectExecutionService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  createGqlOptions(): YogaDriverConfig {
    const isDebugMode =
      this.twentyConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT;
    const plugins = [
      useDirectExecution({
        directExecutionService: this.directExecutionService,
        featureFlagService: this.featureFlagService,
      }),
      useGraphQLErrorHandlerHook({
        metricsService: this.metricsService,
        exceptionHandlerService: this.exceptionHandlerService,
        i18nService: this.i18nService,
        twentyConfigService: this.twentyConfigService,
      }),
      useDisableIntrospectionAndSuggestionsForUnauthenticatedUsers(
        this.twentyConfigService.get('NODE_ENV') === NodeEnvironment.PRODUCTION,
      ),
      useValidateGraphqlQueryComplexity({
        maximumAllowedFields:
          this.twentyConfigService.get('GRAPHQL_MAX_FIELDS'),
        maximumAllowedRootResolvers: this.twentyConfigService.get(
          'GRAPHQL_MAX_ROOT_RESOLVERS',
        ),
        checkDuplicateRootResolvers: true,
      }),
    ];

    if (Sentry.isInitialized()) {
      plugins.push(useSentryTracing());
    }

    const config: YogaDriverConfig = {
      autoSchemaFile: true,
      include: [CoreEngineModule],
      resolverSchemaScope: 'core',
      buildSchemaOptions: {},
      resolvers: { JSON: GraphQLJSON },
      plugins: plugins,
      context: () => ({
        loaders: this.dataloaderService.createLoaders(),
      }),
    };

    if (isDebugMode) {
      config.renderGraphiQL = () => {
        return renderApolloPlayground();
      };
    }

    return config;
  }

  async createSchema(
    context: YogaDriverServerContext<'express'> & YogaInitialContext,
    workspace: FlatWorkspace,
    applicationId?: string,
  ): Promise<GraphQLSchemaWithContext<YogaDriverServerContext<'express'>>> {
    // Create a new contextId for each request
    const contextId = ContextIdFactory.create();

    if (this.moduleRef.registerRequestByContextId) {
      // Register the request in the contextId
      this.moduleRef.registerRequestByContextId(context.req, contextId);
    }

    // Resolve the WorkspaceSchemaFactory for the contextId
    const workspaceFactory = await this.moduleRef.resolve(
      WorkspaceSchemaFactory,
      contextId,
      {
        strict: false,
      },
    );

    await this.metricsService.incrementCounter({
      key: MetricsKeys.GraphqlSchemaBuild,
      shouldStoreInCache: false,
    });

    return await workspaceFactory.createGraphQLSchema(workspace, applicationId);
  }
}
