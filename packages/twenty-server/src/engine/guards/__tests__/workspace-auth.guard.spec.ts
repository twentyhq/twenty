// oxlint-disable twenty/graphql-resolvers-should-be-guarded
import {
  type ExecutionContext,
  ForbiddenException,
  Module,
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
import { type GraphQLSchema, graphql } from 'graphql';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

@Resolver()
class TestResolver {
  @Query(() => String)
  @UseGuards(WorkspaceAuthGuard)
  guardedQuery(): string {
    return 'ok';
  }
}

@Module({ providers: [TestResolver] })
class FeatureModule {}

// Mirrors the root module so an exception no typed filter claims lands in the
// catch-all filter, as it does in production.
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

const runGuardedQuery = async (request: Record<string, unknown>) => {
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

describe('WorkspaceAuthGuard', () => {
  it('should let a workspace-scoped request through', async () => {
    const result = await runGuardedQuery({
      user: { id: 'user-id' },
      workspace: { id: 'workspace-id' },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.guardedQuery).toBe('ok');
  });

  it('should report an unauthenticated request as UNAUTHENTICATED', async () => {
    const result = await runGuardedQuery({});

    expect(result.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.UNAUTHENTICATED,
    );
  });

  // Asserted on the exception rather than the code, which the Yoga error handler
  // derives from the HTTP status further down than this harness reaches.
  it('should keep refusing an authenticated request with no workspace', async () => {
    const result = await runGuardedQuery({ user: { id: 'user-id' } });

    expect(result.errors?.[0]?.originalError).toBeInstanceOf(
      ForbiddenException,
    );
    expect(result.errors?.[0]?.message).toBe('Forbidden resource');
  });

  it('should keep refusing an unauthenticated REST request without throwing', () => {
    const guard = new WorkspaceAuthGuard();

    const httpContext = {
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(httpContext)).toBe(false);
  });
});
