import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { GqlOptionsFactory } from '@nestjs/graphql';

import {
  YogaDriverConfig,
  YogaDriverServerContext,
} from '@graphql-yoga/nestjs';
import * as Sentry from '@sentry/node';
import { GraphQLError, GraphQLSchema } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { GraphQLSchemaWithContext, YogaInitialContext } from 'graphql-yoga';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { useThrottler } from 'src/engine/api/graphql/graphql-config/hooks/use-throttler';
import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { useSentryTracing } from 'src/engine/core-modules/exception-handler/hooks/use-sentry-tracing';
import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { handleExceptionAndConvertToGraphQLError } from 'src/engine/utils/global-exception-handler.util';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: User;
  workspace?: Workspace;
}

@Injectable()
export class GraphQLConfigService
  implements GqlOptionsFactory<YogaDriverConfig<'express'>>
{
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly environmentService: EnvironmentService,
    private readonly moduleRef: ModuleRef,
  ) {}

  createGqlOptions(): YogaDriverConfig {
    const isDebugMode = this.environmentService.get('DEBUG_MODE');
    const plugins = [
      useThrottler({
        ttl: this.environmentService.get('API_RATE_LIMITING_TTL'),
        limit: this.environmentService.get('API_RATE_LIMITING_LIMIT'),
        identifyFn: (context) => {
          return context.req.user?.id ?? context.req.ip ?? 'anonymous';
        },
      }),
      useGraphQLErrorHandlerHook({
        exceptionHandlerService: this.exceptionHandlerService,
      }),
    ];

    if (Sentry.isInitialized()) {
      plugins.push(useSentryTracing());
    }

    const config: YogaDriverConfig = {
      autoSchemaFile: true,
      include: [CoreEngineModule],
      conditionalSchema: async (context) => {
        let user: User | null | undefined;
        let workspace: Workspace | undefined;

        try {
          const { user, workspace, apiKey, workspaceMemberId } = context.req;

          if (!workspace) {
            return new GraphQLSchema({});
          }

          return await this.createSchema(context, {
            user,
            workspace,
            apiKey,
            workspaceMemberId,
          });
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
            user
              ? {
                  id: user.id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                }
              : undefined,
            workspace
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
    data: AuthContext,
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

    return await workspaceFactory.createGraphQLSchema(data);
  }
}
