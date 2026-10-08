// oxlint-disable twenty/graphql-resolvers-should-be-guarded, twenty/rest-api-methods-should-be-guarded
import {
  type CanActivate,
  Controller,
  Get,
  Module,
  type Type,
  UseGuards,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  GraphQLModule,
  GraphQLSchemaHost,
  type GraphQLSchemaHost as GraphQLSchemaHostType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { type NextFunction, type Request, type Response } from 'express';
import { type GraphQLSchema, graphql } from 'graphql';
import supertest from 'supertest';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

const EXCEPTION_HANDLER_SERVICE_PROVIDER = {
  provide: ExceptionHandlerService,
  useValue: { captureExceptions: () => [] },
};

// real Nest + Yoga app so a guard refusal reaches the catch-all filter as in production
export const runGuardedQuery = async ({
  guard,
  request,
}: {
  guard: Type<CanActivate>;
  request: Record<string, unknown>;
}) => {
  @Resolver()
  class TestResolver {
    @Query(() => String)
    @UseGuards(guard)
    guardedQuery(): string {
      return 'ok';
    }
  }

  @Module({ providers: [TestResolver] })
  class FeatureModule {}

  @Module({
    imports: [
      GraphQLModule.forRoot<YogaDriverConfig>({
        driver: YogaDriver,
        autoSchemaFile: true,
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
    source: '{ guardedQuery }',
    contextValue: { req: request },
  });

  await app.close();

  return result;
};

export const runGuardedRestRequest = async ({
  guard,
  request,
}: {
  guard: Type<CanActivate>;
  request: Record<string, unknown>;
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
