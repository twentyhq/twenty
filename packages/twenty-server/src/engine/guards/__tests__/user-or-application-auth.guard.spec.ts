import { type ExecutionContext, ForbiddenException } from '@nestjs/common';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { runGuardedQuery } from 'src/engine/guards/__tests__/run-guarded-query.test-util';
import { UserOrApplicationAuthGuard } from 'src/engine/guards/user-or-application-auth.guard';

const runQuery = (request: Record<string, unknown>) =>
  runGuardedQuery({ guard: UserOrApplicationAuthGuard, request });

describe('UserOrApplicationAuthGuard', () => {
  it('should let a user-scoped request through', async () => {
    const result = await runQuery({ user: { id: 'user-id' } });

    expect(result.errors).toBeUndefined();
    expect(result.data?.guardedQuery).toBe('ok');
  });

  it('should let an application-scoped request through', async () => {
    const result = await runQuery({ application: { id: 'application-id' } });

    expect(result.errors).toBeUndefined();
    expect(result.data?.guardedQuery).toBe('ok');
  });

  it('should let a request carrying both an application and a user through', async () => {
    const result = await runQuery({
      application: { id: 'application-id' },
      user: { id: 'user-id' },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.guardedQuery).toBe('ok');
  });

  it('should report an unauthenticated request as UNAUTHENTICATED', async () => {
    const result = await runQuery({});

    expect(result.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.UNAUTHENTICATED,
    );
  });

  it('should keep refusing an API key, which is neither a user nor an application', async () => {
    const result = await runQuery({ apiKey: { id: 'api-key-id' } });

    expect(result.errors?.[0]?.originalError).toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('should keep refusing an unauthenticated REST request without throwing', () => {
    const guard = new UserOrApplicationAuthGuard();

    const httpContext = {
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(httpContext)).toBe(false);
  });
});
