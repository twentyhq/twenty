import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

describe('LoginTokenService', () => {
  const signAsyncOrThrow = jest.fn().mockResolvedValue('signed-login-token');

  const service = new LoginTokenService(
    { signAsyncOrThrow } as unknown as JwtWrapperService,
    { get: () => '15m' } as unknown as TwentyConfigService,
    {} as CacheStorageService,
  );

  beforeEach(() => {
    signAsyncOrThrow.mockClear();
  });

  describe('generateLoginToken', () => {
    it('signs an impersonation login token naming its impersonator', async () => {
      const { token } = await service.generateLoginToken(
        'test@example.com',
        'workspace-id',
        AuthProviderEnum.Impersonation,
        { impersonatorUserWorkspaceId: 'impersonator-user-workspace-id' },
      );

      expect(token).toBe('signed-login-token');
      expect(signAsyncOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          authProvider: AuthProviderEnum.Impersonation,
          impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
        }),
        { expiresIn: '15m' },
      );
    });

    it('refuses to sign an impersonation login token naming no impersonator', async () => {
      await expect(
        service.generateLoginToken(
          'test@example.com',
          'workspace-id',
          AuthProviderEnum.Impersonation,
        ),
      ).rejects.toMatchObject({
        code: AuthExceptionCode.FORBIDDEN_EXCEPTION,
      });

      expect(signAsyncOrThrow).not.toHaveBeenCalled();
    });
  });
});
