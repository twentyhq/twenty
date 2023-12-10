import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, ContextIdFactory, ModuleRef } from '@nestjs/core';

import { GraphQLError, GraphQLSchema } from 'graphql';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

import { WorkspaceFactory } from 'src/workspace/workspace.factory';
import { TypeOrmExceptionFilter } from 'src/filters/typeorm-exception.filter';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { GlobalExceptionFilter } from 'src/filters/global-exception.filter';
import { TokenService } from 'src/core/auth/services/token.service';
import { Workspace } from 'src/core/workspace/workspace.entity';

import { AppService } from './app.service';

import { CoreModule } from './core/core.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<YogaDriverConfig>({
      context: ({ req }) => ({ req }),
      driver: YogaDriver,
      autoSchemaFile: true,
      include: [CoreModule],
      conditionalSchema: async (request) => {
        try {
          // Get TokenService from AppModule
          const tokenService = AppModule.moduleRef.get(TokenService, {
            strict: false,
          });

          let workspace: Workspace;

          try {
            workspace = await tokenService.validateToken(request.req);
          } catch (err) {
            return new GraphQLSchema({});
          }

          const contextId = ContextIdFactory.create();

          AppModule.moduleRef.registerRequestByContextId(request, contextId);

          // Get the SchemaGenerationService from the AppModule
          const workspaceFactory = await AppModule.moduleRef.resolve(
            WorkspaceFactory,
            contextId,
            {
              strict: false,
            },
          );

          return await workspaceFactory.createGraphQLSchema(workspace.id);
        } catch (error) {
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
          throw error;
        }
      },
      resolvers: { JSON: GraphQLJSON },
      plugins: [],
    }),
    HealthModule,
    IntegrationsModule,
    CoreModule,
    WorkspaceModule,
  ],
  providers: [
    AppService,
    // Exceptions filters must be ordered from the least specific to the most specific
    // If TypeOrmExceptionFilter handle something, HttpExceptionFilter will not handle it
    // GlobalExceptionFilter will handle the rest of the exceptions
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
  ],
})
export class AppModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    AppModule.moduleRef = this.moduleRef;
  }
}
