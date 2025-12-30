import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { type GqlOptionsFactory } from '@nestjs/graphql';

import {
  type YogaDriverConfig,
  type YogaDriverServerContext,
} from '@graphql-yoga/nestjs';
import * as Sentry from '@sentry/node';
import { GraphQLError, GraphQLSchema } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  type GraphQLSchemaWithContext,
  type YogaInitialContext,
} from 'graphql-yoga';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import {
  ApiConfig,
  Billing,
  Captcha,
  ClientAIModelConfig,
  NativeModelCapabilities,
  PublicFeatureFlag,
  PublicFeatureFlagMetadata,
  Sentry as SentryConfig,
  Support,
} from 'src/engine/core-modules/client-config/client-config.entity';
import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { useSentryTracing } from 'src/engine/core-modules/exception-handler/hooks/use-sentry-tracing';
import { useDisableIntrospectionAndSuggestionsForUnauthenticatedUsers } from 'src/engine/core-modules/graphql/hooks/use-disable-introspection-and-suggestions-for-unauthenticated-users.hook';
import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { useValidateGraphqlQueryComplexity } from 'src/engine/core-modules/graphql/hooks/use-validate-graphql-query-complexity.hook';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { handleExceptionAndConvertToGraphQLError } from 'src/engine/utils/global-exception-handler.util';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: UserEntity;
  workspace?: WorkspaceEntity;
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
  ) {}

  createGqlOptions(): YogaDriverConfig {
    const isDebugMode =
      this.twentyConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT;
    const plugins = [
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
      buildSchemaOptions: {
        orphanedTypes: [
          ApiConfig,
          Billing,
          Captcha,
          ClientAIModelConfig,
          NativeModelCapabilities,
          PublicFeatureFlag,
          PublicFeatureFlagMetadata,
          SentryConfig,
          Support,
        ],
      },
      conditionalSchema: async (context) => {
        const { workspace, user } = context.req;

        try {
          if (!isDefined(workspace)) {
            return new GraphQLSchema({});
          }

          return await this.createSchema(context, workspace);
        } catch (error) {
          if (error instanceof UnauthorizedException) {
            throw new GraphQLError('Unauthenticated', {
              extensions: {
                code: 'UNAUTHENTICATED',
              },
            });
          }

          if (error instanceof JsonWebTokenError) {
            //mockedUserJWT
            throw new GraphQLError('Unauthenticated', {
              extensions: {
                code: 'UNAUTHENTICATED',
              },
            });
          }

          if (error instanceof TokenExpiredError) {
            throw new GraphQLError('Unauthenticated', {
              extensions: {
                code: 'UNAUTHENTICATED',
              },
            });
          }

          throw handleExceptionAndConvertToGraphQLError(
            error,
            this.exceptionHandlerService,
            isDefined(user)
              ? {
                  id: user.id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                }
              : undefined,
            isDefined(workspace)
              ? {
                  id: workspace.id,
                  displayName: workspace.displayName,
                  activationStatus: workspace.activationStatus,
                }
              : undefined,
          );
        }
      },
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
    workspace: WorkspaceEntity,
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

    return await workspaceFactory.createGraphQLSchema(workspace);
  }
}
