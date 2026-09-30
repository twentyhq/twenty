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
    get: jest.fn().mockReturnValue('1h'),
  };
  const consumedKeys = new Set<string>();
  const cacheStorage = {
    setIfAbsent: jest.fn(async (key: string) => {
      if (consumedKeys.has(key)) {
        return false;
      }

      consumedKeys.add(key);

      return true;
    }),
  };
  const service = new LoginTokenService(
    jwtWrapperService as never,
    twentyConfigService as never,
    cacheStorage as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    consumedKeys.clear();
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

  it('rejects a login token without an authentication provider', async () => {
    jwtWrapperService.decode.mockReturnValue({
      type: JwtTokenTypeEnum.LOGIN,
      sub: 'test@example.com',
      workspaceId: 'workspace-id',
    });

    await expect(service.verifyLoginToken('login-token')).rejects.toMatchObject(
      {
        code: AuthExceptionCode.UNAUTHENTICATED,
      },
    );
  });

  it('generates login tokens with a unique jti', async () => {
    await service.generateLoginToken(
      'test@example.com',
      'workspace-id',
      AuthProviderEnum.Password,
    );
    await service.generateLoginToken(
      'test@example.com',
      'workspace-id',
      AuthProviderEnum.Password,
    );

    const [[firstPayload], [secondPayload]] =
      jwtWrapperService.signAsyncOrThrow.mock.calls;

    expect(firstPayload.jti).toEqual(expect.any(String));
    expect(firstPayload.jti).not.toEqual(secondPayload.jti);
  });

  it('consumes a login token only once', async () => {
    const payload = {
      type: JwtTokenTypeEnum.LOGIN,
      sub: 'test@example.com',
      workspaceId: 'workspace-id',
      authProvider: AuthProviderEnum.Password,
      jti: 'login-token-jti',
    } as const;

    await expect(
      service.consumeLoginTokenOrThrow(payload),
    ).resolves.toBeUndefined();
    await expect(
      service.consumeLoginTokenOrThrow(payload),
    ).rejects.toMatchObject({ code: AuthExceptionCode.UNAUTHENTICATED });
  });

  it('rejects consuming a login token without a jti', async () => {
    await expect(
      service.consumeLoginTokenOrThrow({
        type: JwtTokenTypeEnum.LOGIN,
        sub: 'test@example.com',
        workspaceId: 'workspace-id',
        authProvider: AuthProviderEnum.Password,
      }),
    ).rejects.toMatchObject({ code: AuthExceptionCode.UNAUTHENTICATED });
    expect(cacheStorage.setIfAbsent).not.toHaveBeenCalled();
  });
});
