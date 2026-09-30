import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

import { LoginTokenService } from './login-token.service';

describe('LoginTokenService', () => {
  const jwtWrapperService = {
    decode: jest.fn(),
    signAsyncOrThrow: jest.fn(),
    verifyJwtToken: jest.fn(),
  };
  const twentyConfigService = {
    get: jest.fn().mockReturnValue('15m'),
  };
  const cacheStorageService = {
    setIfAbsent: jest.fn(),
  };
  const service = new LoginTokenService(
    jwtWrapperService as never,
    twentyConfigService as never,
    cacheStorageService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    twentyConfigService.get.mockReturnValue('15m');
  });

  it('does not generate a login token without an authentication provider', async () => {
    await expect(
      service.generateLoginToken(
        'test@example.com',
        'workspace-id',
        undefined as never,
      ),
    ).rejects.toMatchObject({ code: AuthExceptionCode.INVALID_INPUT });

    expect(jwtWrapperService.signAsyncOrThrow).not.toHaveBeenCalled();
  });

  it('generates a login token with a unique jti', async () => {
    jwtWrapperService.signAsyncOrThrow.mockResolvedValue('signed-token');

    const result = await service.generateLoginToken(
      'test@example.com',
      'workspace-id',
      AuthProviderEnum.Password,
    );

    expect(result.token).toBe('signed-token');
    expect(jwtWrapperService.signAsyncOrThrow).toHaveBeenCalledTimes(1);

    const [payload] = jwtWrapperService.signAsyncOrThrow.mock.calls[0];

    expect(payload.jti).toBeDefined();
    expect(typeof payload.jti).toBe('string');
  });

  it('rejects a login token without an authentication provider', async () => {
    jwtWrapperService.decode.mockReturnValue({
      type: JwtTokenTypeEnum.LOGIN,
      sub: 'test@example.com',
      workspaceId: 'workspace-id',
      jti: 'jti-1',
    });

    await expect(service.verifyLoginToken('login-token')).rejects.toMatchObject(
      {
        code: AuthExceptionCode.UNAUTHENTICATED,
      },
    );
  });

  it('rejects a login token without a jti', async () => {
    jwtWrapperService.decode.mockReturnValue({
      type: JwtTokenTypeEnum.LOGIN,
      sub: 'test@example.com',
      workspaceId: 'workspace-id',
      authProvider: AuthProviderEnum.Password,
    });

    await expect(service.verifyLoginToken('login-token')).rejects.toMatchObject(
      {
        code: AuthExceptionCode.UNAUTHENTICATED,
      },
    );
  });

  it('consumes a login token only once', async () => {
    cacheStorageService.setIfAbsent.mockResolvedValueOnce(true);

    await expect(
      service.consumeLoginTokenOrThrow({
        type: JwtTokenTypeEnum.LOGIN,
        sub: 'test@example.com',
        workspaceId: 'workspace-id',
        authProvider: AuthProviderEnum.Password,
        jti: 'jti-1',
        exp: Math.floor(Date.now() / 1000) + 900,
      }),
    ).resolves.toBeUndefined();

    expect(cacheStorageService.setIfAbsent).toHaveBeenCalledTimes(1);

    cacheStorageService.setIfAbsent.mockResolvedValueOnce(false);

    await expect(
      service.consumeLoginTokenOrThrow({
        type: JwtTokenTypeEnum.LOGIN,
        sub: 'test@example.com',
        workspaceId: 'workspace-id',
        authProvider: AuthProviderEnum.Password,
        jti: 'jti-1',
        exp: Math.floor(Date.now() / 1000) + 900,
      }),
    ).rejects.toMatchObject({
      code: AuthExceptionCode.UNAUTHENTICATED,
    });
  });
});
