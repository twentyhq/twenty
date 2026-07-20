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

import { SsoExchangeTokenService } from './sso-exchange-token.service';

const USER_ID = '20202020-9e3b-46d4-a556-88b9ddc2b034';

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

describe('SsoExchangeTokenService', () => {
  let service: SsoExchangeTokenService;
  let twentyConfigService: TwentyConfigService;
  let appTokenRepository: Repository<AppTokenEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SsoExchangeTokenService,
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

    service = module.get<SsoExchangeTokenService>(SsoExchangeTokenService);
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
    jest
      .spyOn(appTokenRepository, 'remove')
      .mockImplementation(async (entity) => entity as AppTokenEntity);
  });

  describe('generateSsoExchangeToken', () => {
    it('should persist only the hash of the token, never the plaintext', async () => {
      const { token } = await service.generateSsoExchangeToken({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Google,
      });

      const savedToken = jest.mocked(appTokenRepository.save).mock
        .calls[0][0] as AppTokenEntity;

      expect(savedToken.value).toBe(sha256(token));
      expect(savedToken.value).not.toBe(token);
      expect(savedToken.type).toBe(AppTokenType.SsoExchangeToken);
      expect(savedToken.userId).toBe(USER_ID);
      expect(savedToken.context).toEqual({
        authProvider: AuthProviderEnum.Google,
      });
    });

    it('should use the short term token expiration', async () => {
      await service.generateSsoExchangeToken({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Microsoft,
      });

      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'SHORT_TERM_TOKEN_EXPIRES_IN',
      );
    });

    it('should generate a different token on every call', async () => {
      const first = await service.generateSsoExchangeToken({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Google,
      });
      const second = await service.generateSsoExchangeToken({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Google,
      });

      expect(first.token).not.toBe(second.token);
    });
  });

  describe('validateAndConsumeSsoExchangeTokenOrThrow', () => {
    const buildAppToken = (): AppTokenEntity =>
      ({
        id: 'app-token-id',
        userId: USER_ID,
        type: AppTokenType.SsoExchangeToken,
        value: sha256('plain-token'),
        expiresAt: new Date(Date.now() + 60_000),
        context: { authProvider: AuthProviderEnum.Google },
      }) as AppTokenEntity;

    it('should look the token up by hash and scoped to the SSO exchange type', async () => {
      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(buildAppToken());

      await service.validateAndConsumeSsoExchangeTokenOrThrow('plain-token');

      expect(appTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          value: sha256('plain-token'),
          type: AppTokenType.SsoExchangeToken,
        },
      });
    });

    it('should return the user and auth provider, and consume the token', async () => {
      const appToken = buildAppToken();

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(appToken);

      const result =
        await service.validateAndConsumeSsoExchangeTokenOrThrow('plain-token');

      expect(result).toEqual({
        userId: USER_ID,
        authProvider: AuthProviderEnum.Google,
      });
      expect(appTokenRepository.remove).toHaveBeenCalledWith(appToken);
    });

    it('should throw when the token has already been consumed', async () => {
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateAndConsumeSsoExchangeTokenOrThrow('plain-token'),
      ).rejects.toThrow(AuthException);
    });

    it('should throw and still consume the token when it has expired', async () => {
      const expiredToken = buildAppToken();

      expiredToken.expiresAt = new Date(Date.now() - 1);

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(expiredToken);

      await expect(
        service.validateAndConsumeSsoExchangeTokenOrThrow('plain-token'),
      ).rejects.toThrow(AuthException);
      expect(appTokenRepository.remove).toHaveBeenCalledWith(expiredToken);
    });

    it('should throw when the auth provider is missing from the token context', async () => {
      const tokenWithoutProvider = buildAppToken();

      tokenWithoutProvider.context = null;

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(tokenWithoutProvider);

      await expect(
        service.validateAndConsumeSsoExchangeTokenOrThrow('plain-token'),
      ).rejects.toThrow(AuthException);
    });
  });
});
