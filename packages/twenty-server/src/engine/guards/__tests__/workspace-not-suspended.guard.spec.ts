import { type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { RESOLVER_SCHEMA_SCOPE_KEY } from 'src/engine/api/graphql/graphql-config/constants/resolver-schema-scope-key.constant';
import { ALLOW_SUSPENDED_WORKSPACE_KEY } from 'src/engine/guards/constants/allow-suspended-workspace-key.constant';
import { WorkspaceNotSuspendedGuard } from 'src/engine/guards/workspace-not-suspended.guard';

const SUSPENDED_STATUSES = [
  WorkspaceActivationStatus.SUSPENDED,
  WorkspaceActivationStatus.INACTIVE,
];

const buildGraphqlContext = ({
  workspace,
  operation,
  isSuspendedWorkspaceAllowed = false,
  resolverSchemaScope = 'metadata',
}: {
  workspace: Record<string, unknown> | undefined;
  operation: string;
  isSuspendedWorkspaceAllowed?: boolean;
  resolverSchemaScope?: string;
}) => {
  const reflector = new Reflector();

  jest
    .spyOn(reflector, 'getAllAndOverride')
    .mockImplementation((key) =>
      key === ALLOW_SUSPENDED_WORKSPACE_KEY
        ? isSuspendedWorkspaceAllowed
        : undefined,
    );

  jest
    .spyOn(reflector, 'get')
    .mockImplementation((key) =>
      key === RESOLVER_SCHEMA_SCOPE_KEY ? resolverSchemaScope : undefined,
    );

  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req: { workspace } }),
    getInfo: () => ({ operation: { operation } }),
  } as any);

  const context = {
    getType: () => 'graphql',
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;

  return { guard: new WorkspaceNotSuspendedGuard(reflector), context };
};

const expectSuspendedThrow = (run: () => boolean) => {
  expect(run).toThrow(AuthException);
  expect(run).toThrow(
    expect.objectContaining({ code: AuthExceptionCode.WORKSPACE_SUSPENDED }),
  );
};

describe('WorkspaceNotSuspendedGuard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    WorkspaceActivationStatus.ACTIVE,
    WorkspaceActivationStatus.CREATED,
    WorkspaceActivationStatus.PENDING_CREATION,
  ])('should let a %s workspace mutate', (activationStatus) => {
    const { guard, context } = buildGraphqlContext({
      workspace: { id: 'workspace-id', activationStatus },
      operation: 'mutation',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should let an unauthenticated request through', () => {
    const { guard, context } = buildGraphqlContext({
      workspace: undefined,
      operation: 'mutation',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it.each(SUSPENDED_STATUSES)(
    'should let a %s workspace read on the metadata schema',
    (activationStatus) => {
      const { guard, context } = buildGraphqlContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'query',
      });

      expect(guard.canActivate(context)).toBe(true);
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should refuse a %s workspace read on the core schema',
    (activationStatus) => {
      const { guard, context } = buildGraphqlContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'query',
        resolverSchemaScope: 'core',
      });

      expectSuspendedThrow(() => guard.canActivate(context));
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should let a %s workspace read on the admin schema',
    (activationStatus) => {
      const { guard, context } = buildGraphqlContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'query',
        resolverSchemaScope: 'admin',
      });

      expect(guard.canActivate(context)).toBe(true);
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should refuse a %s workspace mutation',
    (activationStatus) => {
      const { guard, context } = buildGraphqlContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'mutation',
      });

      expectSuspendedThrow(() => guard.canActivate(context));
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should refuse a %s workspace subscription',
    (activationStatus) => {
      const { guard, context } = buildGraphqlContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'subscription',
      });

      expectSuspendedThrow(() => guard.canActivate(context));
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should let an exempted mutation through on a %s workspace',
    (activationStatus) => {
      const { guard, context } = buildGraphqlContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'mutation',
        isSuspendedWorkspaceAllowed: true,
      });

      expect(guard.canActivate(context)).toBe(true);
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should let a soft deleted %s workspace through',
    (activationStatus) => {
      const { guard, context } = buildGraphqlContext({
        workspace: {
          id: 'workspace-id',
          activationStatus,
          deletedAt: '2026-09-16T10:00:00.000Z',
        },
        operation: 'mutation',
      });

      expect(guard.canActivate(context)).toBe(true);
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should refuse a %s workspace on an http request',
    (activationStatus) => {
      const guard = new WorkspaceNotSuspendedGuard(new Reflector());

      const context = {
        getType: () => 'http',
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            workspace: { id: 'workspace-id', activationStatus },
          }),
        }),
      } as unknown as ExecutionContext;

      expectSuspendedThrow(() => guard.canActivate(context));
    },
  );
});
