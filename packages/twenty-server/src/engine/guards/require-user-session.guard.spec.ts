import { type ExecutionContext } from '@nestjs/common';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { runGuardedQuery } from 'src/engine/guards/__tests__/run-guarded-query.test-util';
import { RequireUserSessionGuard } from 'src/engine/guards/require-user-session.guard';

const user = { id: 'user-id' };

const runQuery = (request: Record<string, unknown>) =>
  runGuardedQuery({ guard: RequireUserSessionGuard, request });

describe('RequireUserSessionGuard', () => {
  it.each([
    JwtTokenTypeEnum.ACCESS,
    JwtTokenTypeEnum.PLAYGROUND,
    JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
  ])('should let a %s token carrying a user through', async (tokenType) => {
    const result = await runQuery({ user, tokenType });

    expect(result.errors).toBeUndefined();
    expect(result.data?.guardedQuery).toBe('ok');
  });

  it('should refuse an application token bound to a user', async () => {
    const result = await runQuery({
      user,
      application: { id: 'application-id' },
      tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
    });

    expect(result.errors?.[0]?.extensions?.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should refuse an application token bound to nobody', async () => {
    const result = await runQuery({
      application: { id: 'application-id' },
      tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
    });

    expect(result.errors?.[0]?.extensions?.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should refuse an API key token', async () => {
    const result = await runQuery({
      apiKey: { id: 'api-key-id' },
      tokenType: JwtTokenTypeEnum.API_KEY,
    });

    expect(result.errors?.[0]?.extensions?.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should refuse a user carried by a token type that is not a session', async () => {
    const result = await runQuery({ user, tokenType: JwtTokenTypeEnum.FILE });

    expect(result.errors?.[0]?.extensions?.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should refuse a request whose token type never resolved', async () => {
    const result = await runQuery({ user, tokenType: undefined });

    expect(result.errors?.[0]?.extensions?.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should report a credential-less request as UNAUTHENTICATED', async () => {
    const result = await runQuery({});

    expect(result.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.UNAUTHENTICATED,
    );
  });

  it('should deny a REST request without throwing a GraphQL error', () => {
    const guard = new RequireUserSessionGuard();

    const httpContext = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ apiKey: { id: 'api-key-id' } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(httpContext)).toBe(false);
  });

  it('should deny when there is no request on the context', () => {
    const guard = new RequireUserSessionGuard();

    const httpContext = {
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => undefined }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(httpContext)).toBe(false);
  });
});
