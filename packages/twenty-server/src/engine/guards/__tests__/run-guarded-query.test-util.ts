// oxlint-disable twenty/graphql-resolvers-should-be-guarded
import { type CanActivate, Module, type Type, UseGuards } from '@nestjs/common';
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
import { type GraphQLSchema, graphql } from 'graphql';

import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

// Runs one query through a real Nest + Yoga app so a guard's refusal takes the
// same path as in production: the root module mirrors the real one, so an
// exception no typed filter claims lands in the catch-all filter. The module
// classes are built per call because the resolver's guard is the parameter.
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
    providers: [{ provide: APP_FILTER, useClass: UnhandledExceptionFilter }],
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
