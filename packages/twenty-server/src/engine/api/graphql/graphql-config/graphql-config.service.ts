import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { type GqlOptionsFactory } from '@nestjs/graphql';

import {
  type YogaDriverConfig,
} from '@nestjs/yoga';

import { GraphQLSchema } from 'graphql';
import {
  type GraphQLSchemaWithContext,
  type YogaInitialContext,
} from 'graphql-yoga';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { useDirectExecution } from 'src/engine/api/graphql/direct-execution/hooks/use-direct-execution.hook';
import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { WorkspaceAuthContextUser } from 'src/engine/core-modules/auth/types/workspace-auth-context-user.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleExceptionAndConvertToGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-api-exception-handler.util';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { FeatureFlagService } from 'src/engine/metadata-modules/feature-flag/services/feature-flag.service';

import { isDefined } from 'twenty-shared/utils';

export interface MetadataInitialContext extends YogaInitialContext {
  user?: WorkspaceAuthContextUser;
  workspace?: FlatWorkspace;
}

@Injectable()
export class GraphQLConfigService
  implements GqlOptionsFactory<YogaDriverConfig<'express'>>
{
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly workspaceService: WorkspaceService,
    private readonly moduleRef: ModuleRef,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly directExecutionService: DirectExecutionService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  createGqlOptions(): YogaDriverConfig {
    const isDebugMode =
      this.twentyConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT;

    const conditionalSchema: GraphQLSchemaWithContext<MetadataInitialContext> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __isTypeOf: (obj: any) => obj instanceof GraphQLSchema,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      async __resolveType(context: MetadataInitialContext) {
        try {
          const workspace = context.workspace;
          const applicationId = context.user?.applicationId;

          if (!isDefined(workspace)) {
            throw new AuthenticationError('Unauthenticated');
          }

          return await this.createSchema(workspace, applicationId);
        } catch (error) {
          if (error instanceof UnauthorizedException) {
            throw new AuthenticationError('Unauthenticated');
          }

          if (error instanceof JsonWebTokenError) {
            //mockedUserJWT
            throw new AuthenticationError('Unauthenticated');
          }

          if (error instanceof TokenExpiredError) {
            throw new AuthenticationError('Unauthenticated');
          }

          throw handleExceptionAndConvertToGraphQLError(
            error,
            this.exceptionHandlerService,
          );
        }
      },
    } as any;

    return {
      driver: 'express',
      autoSchemaFile: true,
      path: '/metadata',
      schema: conditionalSchema as any,
      logging: isDebugMode,
      debug: isDebugMode,
      maskedErrors: isDebugMode
        ? false
        : {
            handleParseErrors: true,
            handleValidationErrors: true,
          },
      plugins: [
        useDirectExecution({
          directExecutionService: this.directExecutionService,
          twentyConfigService: this.twentyConfigService,
        }),
      ],
    };
  }

  private async createSchema(
    workspace: FlatWorkspace,
    applicationId?: string,
  ): Promise<GraphQLSchema> {
    const contextId = ContextIdFactory.create();

    this.moduleRef.registerRequestByContextId({ workspace }, contextId);

    const workspaceFactory = await this.moduleRef.resolve(
      WorkspaceSchemaFactory,
      contextId,
      {
        strict: false,
      },
    );

    return await workspaceFactory.createGraphQLSchema(workspace, applicationId);
  }
}
