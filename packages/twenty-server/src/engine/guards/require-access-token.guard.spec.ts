import { type ExecutionContext } from '@nestjs/common';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { RequireAccessTokenGuard } from 'src/engine/guards/require-access-token.guard';

const buildExecutionContext = (
  request: { tokenType?: JwtTokenTypeEnum } | undefined,
): ExecutionContext =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('RequireAccessTokenGuard', () => {
  const guard = new RequireAccessTokenGuard();

  it('allows a session ACCESS token', () => {
    const context = buildExecutionContext({
      tokenType: JwtTokenTypeEnum.ACCESS,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a PLAYGROUND token so it cannot mint further tokens', () => {
    const context = buildExecutionContext({
      tokenType: JwtTokenTypeEnum.PLAYGROUND,
    });

    expect(() => guard.canActivate(context)).toThrow(AuthException);
  });

  it('rejects an API_KEY token', () => {
    const context = buildExecutionContext({
      tokenType: JwtTokenTypeEnum.API_KEY,
    });

    expect(() => guard.canActivate(context)).toThrow(AuthException);
  });

  it('rejects a request without a resolved token type', () => {
    const context = buildExecutionContext({ tokenType: undefined });

    expect(() => guard.canActivate(context)).toThrow(AuthException);
  });

  it('denies when there is no request on the context', () => {
    const context = buildExecutionContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });
});
