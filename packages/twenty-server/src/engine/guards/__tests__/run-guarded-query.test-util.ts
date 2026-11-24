// oxlint-disable twenty/graphql-resolvers-should-be-guarded, twenty/graphql-field-resolvers-should-declare-access, twenty/rest-api-methods-should-be-guarded
import {
  type CanActivate,
  Controller,
  Get,
  Module,
  type Provider,
  type Type,
  UseGuards,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  Field,
  GraphQLModule,
  GraphQLSchemaHost,
  type GraphQLSchemaHost as GraphQLSchemaHostType,
  ObjectType,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { type NextFunction, type Request, type Response } from 'express';
import { type GraphQLSchema, graphql } from 'graphql';
import supertest from 'supertest';

import { GRAPHQL_FIELD_RESOLVER_ENHANCERS } from 'src/engine/api/graphql/graphql-config/constants/graphql-field-resolver-enhancers.constant';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

const EXCEPTION_HANDLER_SERVICE_PROVIDER = {
  provide: ExceptionHandlerService,
  useValue: { captureExceptions: () => [] },
};

const runQueryOnGraphqlApp = async ({
  resolver,
  source,
  request,
  providers,
}: {
  resolver: Type<unknown>;
  source: string;
  request: Record<string, unknown>;
  providers: Provider[];
}) => {
  @Module({ providers: [resolver, ...providers] })
  class FeatureModule {}

  @Module({
    imports: [
      GraphQLModule.forRoot<YogaDriverConfig>({
        driver: YogaDriver,
        autoSchemaFile: true,
        fieldResolverEnhancers: GRAPHQL_FIELD_RESOLVER_ENHANCERS,
      }),
      FeatureModule,
    ],
    providers: [
      { provide: APP_FILTER, useClass: UnhandledExceptionFilter },
      EXCEPTION_HANDLER_SERVICE_PROVIDER,
    ],
  })
  class RootModule {}

  const moduleRef = await Test.createTestingModule({
    imports: [RootModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  await app.init();

  const schema = app.get<GraphQLSchemaHostType>(GraphQLSchemaHost)
    .schema as GraphQLSchema;

  const result = await graphql({
    schema,
    source,
    contextValue: { req: request },
  });

  await app.close();

  return result;
};

// real Nest + Yoga app so a guard refusal reaches the catch-all filter as in production
export const runGuardedQuery = async ({
  guard,
  request,
  providers = [],
}: {
  guard: Type<CanActivate>;
  request: Record<string, unknown>;
  providers?: Provider[];
}) => {
  @Resolver()
  class TestResolver {
    @Query(() => String)
    @UseGuards(guard)
    guardedQuery(): string {
      return 'ok';
    }
  }

  return runQueryOnGraphqlApp({
    resolver: TestResolver,
    source: '{ guardedQuery }',
    request,
    providers,
  });
};

@ObjectType('GuardedParent')
class GuardedParent {
  @Field(() => String)
  id: string;
}

export const runGuardedFieldQuery = async ({
  guard,
  request,
  providers = [],
}: {
  guard: Type<CanActivate>;
  request: Record<string, unknown>;
  providers?: Provider[];
}) => {
  @Resolver(() => GuardedParent)
  class TestResolver {
    @Query(() => GuardedParent)
    parent(): GuardedParent {
      return { id: 'parent-id' };
    }

    @ResolveField(() => String)
    @UseGuards(guard)
    guardedField(): string {
      return 'ok';
    }
  }

  return runQueryOnGraphqlApp({
    resolver: TestResolver,
    source: '{ parent { id guardedField } }',
    request,
    providers,
  });
};

export const runGuardedRestRequest = async ({
  guard,
  request,
  providers = [],
}: {
  guard: Type<CanActivate>;
  request: Record<string, unknown>;
  providers?: Provider[];
}) => {
  @Controller('guarded')
  class TestController {
    @Get()
    @UseGuards(guard)
    guardedRoute(): string {
      return 'ok';
    }
  }

  @Module({
    controllers: [TestController],
    providers: [
      { provide: APP_FILTER, useClass: UnhandledExceptionFilter },
      EXCEPTION_HANDLER_SERVICE_PROVIDER,
      ...providers,
    ],
  })
  class RootModule {}

  const moduleRef = await Test.createTestingModule({
    imports: [RootModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.use(
    (incomingRequest: Request, _response: Response, next: NextFunction) => {
      Object.assign(incomingRequest, request);
      next();
    },
  );

  await app.init();

  const response = await supertest(app.getHttpServer()).get('/guarded');

  await app.close();

  return response;
};
