import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { NoImpersonationGuard } from 'src/engine/guards/no-impersonation.guard';

const mockGraphqlRequest = (req: Record<string, unknown>) => {
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req }),
  } as unknown as GqlExecutionContext);
};

describe('NoImpersonationGuard', () => {
  const guard = new NoImpersonationGuard();
  const executionContext = {} as ExecutionContext;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows a regular session', () => {
    mockGraphqlRequest({});

    expect(guard.canActivate(executionContext)).toBe(true);
  });

  it('rejects an impersonated session with a user-friendly message', () => {
    mockGraphqlRequest({
      impersonationContext: {
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
        impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
      },
    });

    let thrownError: unknown;

    try {
      guard.canActivate(executionContext);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(ForbiddenError);
    expect(
      (thrownError as ForbiddenError).extensions.userFriendlyMessage,
    ).toBeDefined();
  });
});
