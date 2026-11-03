import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

const buildService = (decodedPayload: Partial<LoginTokenJwtPayload>) =>
  new LoginTokenService(
    {
      verifyJwtToken: jest.fn().mockResolvedValue(undefined),
      decode: jest.fn().mockReturnValue({
        type: JwtTokenTypeEnum.LOGIN,
        sub: 'admin@example.com',
        workspaceId: 'workspace-id',
        authProvider: AuthProviderEnum.Password,
        ...decodedPayload,
      }),
    } as unknown as JwtWrapperService,
    {} as TwentyConfigService,
    {} as CacheStorageService,
  );

describe('LoginTokenService.verifyLoginToken', () => {
  it('accepts a regular token where no purpose is expected', async () => {
    await expect(
      buildService({}).verifyLoginToken('token'),
    ).resolves.toMatchObject({ sub: 'admin@example.com' });
  });

  it('refuses an admin console token on the regular sign-in path', async () => {
    await expect(
      buildService({ purpose: 'admin-console' }).verifyLoginToken('token'),
    ).rejects.toThrow('Login token is not valid for this operation');
  });

  it('refuses a regular token where an admin console token is expected', async () => {
    await expect(
      buildService({}).verifyLoginToken('token', { purpose: 'admin-console' }),
    ).rejects.toThrow('Login token is not valid for this operation');
  });

  it('accepts an admin console token where one is expected', async () => {
    await expect(
      buildService({ purpose: 'admin-console' }).verifyLoginToken('token', {
        purpose: 'admin-console',
      }),
    ).resolves.toMatchObject({ purpose: 'admin-console' });
  });
});
