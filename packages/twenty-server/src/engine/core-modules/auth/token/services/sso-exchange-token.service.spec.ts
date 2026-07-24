import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import crypto from 'crypto';

import { Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

import { SSOExchangeTokenService } from './sso-exchange-token.service';

const USER_ID = '20202020-9e3b-46d4-a556-88b9ddc2b034';

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

describe('SSOExchangeTokenService', () => {
  let service: SSOExchangeTokenService;
  let twentyConfigService: TwentyConfigService;
  let appTokenRepository: Repository<AppTokenEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SSOExchangeTokenService,
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue('5m') },
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SSOExchangeTokenService>(SSOExchangeTokenService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    appTokenRepository = module.get<Repository<AppTokenEntity>>(
      getRepositoryToken(AppTokenEntity),
    );

    jest
      .spyOn(appTokenRepository, 'create')
      .mockImplementation((entity) => entity as AppTokenEntity);
    jest
      .spyOn(appTokenRepository, 'save')
      .mockImplementation(async (entity) => entity as AppTokenEntity);
  });

  describe('generateSSOExchangeToken', () => {
    it('should persist only the hash of the token, never the plaintext', async () => {
      const { token } = await service.generateSSOExchangeToken({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Google,
      });

      const savedToken = jest.mocked(appTokenRepository.save).mock
        .calls[0][0] as AppTokenEntity;

      expect(savedToken.value).toBe(sha256(token));
      expect(savedToken.value).not.toBe(token);
      expect(savedToken.type).toBe(AppTokenType.SSOExchangeToken);
      expect(savedToken.userId).toBe(USER_ID);
      expect(savedToken.context).toEqual({
        authProvider: AuthProviderEnum.Google,
      });
    });

    it('should use the short term token expiration', async () => {
      await service.generateSSOExchangeToken({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Microsoft,
      });

      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'SHORT_TERM_TOKEN_EXPIRES_IN',
      );
    });

    it('should generate a different token on every call', async () => {
      const first = await service.generateSSOExchangeToken({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Google,
      });
      const second = await service.generateSSOExchangeToken({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Google,
      });

      expect(first.token).not.toBe(second.token);
    });
  });

  describe('validateAndConsumeSSOExchangeTokenOrThrow', () => {
    const buildAppToken = (): AppTokenEntity =>
      ({
        id: 'app-token-id',
        userId: USER_ID,
        type: AppTokenType.SSOExchangeToken,
        value: sha256('plain-token'),
        expiresAt: new Date(Date.now() + 60_000),
        context: { authProvider: AuthProviderEnum.Google },
      }) as AppTokenEntity;

    const mockLookup = (appToken: AppTokenEntity | null) => {
      jest
        .spyOn(appTokenRepository, 'findOneBy')
        .mockResolvedValue(appToken as never);
    };

    const mockClaim = (affected: number) => {
      jest
        .spyOn(appTokenRepository, 'delete')
        .mockResolvedValue({ affected, raw: [] } as never);
    };

    it('should return the user and auth provider of the claimed token', async () => {
      mockLookup(buildAppToken());
      mockClaim(1);

      const result =
        await service.validateAndConsumeSSOExchangeTokenOrThrow('plain-token');

      expect(result).toEqual({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Google,
      });
    });

    it('should throw when the token cannot be found', async () => {
      mockLookup(null);

      await expect(
        service.validateAndConsumeSSOExchangeTokenOrThrow('plain-token'),
      ).rejects.toThrow(AuthException);
    });

    it('should throw when the delete does not claim the row', async () => {
      mockLookup(buildAppToken());
      mockClaim(0);

      await expect(
        service.validateAndConsumeSSOExchangeTokenOrThrow('plain-token'),
      ).rejects.toThrow(AuthException);
    });

    it('should throw when the claimed token has expired', async () => {
      const expiredToken = buildAppToken();

      expiredToken.expiresAt = new Date(Date.now() - 1);

      mockLookup(expiredToken);
      mockClaim(1);

      await expect(
        service.validateAndConsumeSSOExchangeTokenOrThrow('plain-token'),
      ).rejects.toThrow(AuthException);
    });

    it('should throw when the auth provider is missing from the token context', async () => {
      const tokenWithoutProvider = buildAppToken();

      tokenWithoutProvider.context = null;

      mockLookup(tokenWithoutProvider);
      mockClaim(1);

      await expect(
        service.validateAndConsumeSSOExchangeTokenOrThrow('plain-token'),
      ).rejects.toThrow(AuthException);
    });
  });
});
