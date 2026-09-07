import { type ExecutionContext, ForbiddenException } from '@nestjs/common';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { runGuardedQuery } from 'src/engine/guards/__tests__/run-guarded-query.test-util';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

const runQuery = (request: Record<string, unknown>) =>
  runGuardedQuery({ guard: UserAuthGuard, request });

describe('UserAuthGuard', () => {
  it('should let a user-scoped request through', async () => {
    const result = await runQuery({ user: { id: 'user-id' } });

    expect(result.errors).toBeUndefined();
    expect(result.data?.guardedQuery).toBe('ok');
  });

  it('should report an unauthenticated request as UNAUTHENTICATED', async () => {
    const result = await runQuery({});

    expect(result.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.UNAUTHENTICATED,
    );
  });

  // Asserted on the exception rather than the code, which the Yoga error handler
  // derives from the HTTP status further down than this harness reaches.
  it('should keep refusing an API key, which authenticates without a user', async () => {
    const result = await runQuery({ apiKey: { id: 'api-key-id' } });

    expect(result.errors?.[0]?.originalError).toBeInstanceOf(
      ForbiddenException,
    );
    expect(result.errors?.[0]?.message).toBe('Forbidden resource');
  });

  it('should keep refusing an application, which authenticates without a user', async () => {
    const result = await runQuery({ application: { id: 'application-id' } });

    expect(result.errors?.[0]?.originalError).toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('should keep refusing an unauthenticated REST request without throwing', () => {
    const guard = new UserAuthGuard();

    const httpContext = {
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(httpContext)).toBe(false);
  });
});
