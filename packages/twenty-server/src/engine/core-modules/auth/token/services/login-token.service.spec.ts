import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

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
  const service = new LoginTokenService(
    jwtWrapperService as never,
    twentyConfigService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
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
});
