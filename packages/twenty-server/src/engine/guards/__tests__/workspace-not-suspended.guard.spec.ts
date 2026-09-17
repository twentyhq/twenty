import { type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { ALLOW_SUSPENDED_WORKSPACE_KEY } from 'src/engine/guards/constants/allow-suspended-workspace-key.constant';
import { WorkspaceNotSuspendedGuard } from 'src/engine/guards/workspace-not-suspended.guard';

const SUSPENDED_STATUSES = [
  WorkspaceActivationStatus.SUSPENDED,
  WorkspaceActivationStatus.INACTIVE,
];

const buildContext = ({
  workspace,
  type = 'graphql',
  operation = 'query',
  isSuspendedWorkspaceAllowed = false,
}: {
  workspace: Record<string, unknown> | undefined;
  type?: string;
  operation?: string;
  isSuspendedWorkspaceAllowed?: boolean;
}) => {
  const reflector = new Reflector();

  jest
    .spyOn(reflector, 'getAllAndOverride')
    .mockImplementation((key) =>
      key === ALLOW_SUSPENDED_WORKSPACE_KEY
        ? isSuspendedWorkspaceAllowed
        : undefined,
    );

  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req: { workspace } }),
    getInfo: () => ({ operation: { operation } }),
  } as any);

  const context = {
    getType: () => type,
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ workspace }) }),
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
    WorkspaceActivationStatus.ONGOING_CREATION,
  ])('should let a %s workspace through', (activationStatus) => {
    const { guard, context } = buildContext({
      workspace: { id: 'workspace-id', activationStatus },
      operation: 'mutation',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should let an unauthenticated request through', () => {
    const { guard, context } = buildContext({ workspace: undefined });

    expect(guard.canActivate(context)).toBe(true);
  });

  it.each(SUSPENDED_STATUSES)(
    'should refuse an undeclared query on a %s workspace',
    (activationStatus) => {
      const { guard, context } = buildContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'query',
      });

      expectSuspendedThrow(() => guard.canActivate(context));
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should refuse an undeclared mutation on a %s workspace',
    (activationStatus) => {
      const { guard, context } = buildContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'mutation',
      });

      expectSuspendedThrow(() => guard.canActivate(context));
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should refuse an undeclared subscription on a %s workspace',
    (activationStatus) => {
      const { guard, context } = buildContext({
        workspace: { id: 'workspace-id', activationStatus },
        operation: 'subscription',
      });

      expectSuspendedThrow(() => guard.canActivate(context));
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should refuse an undeclared http request on a %s workspace',
    (activationStatus) => {
      const { guard, context } = buildContext({
        workspace: { id: 'workspace-id', activationStatus },
        type: 'http',
      });

      expectSuspendedThrow(() => guard.canActivate(context));
    },
  );

  it.each(SUSPENDED_STATUSES)(
    'should let a declared handler through on a %s workspace',
    (activationStatus) => {
      const { guard, context } = buildContext({
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
      const { guard, context } = buildContext({
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
});
