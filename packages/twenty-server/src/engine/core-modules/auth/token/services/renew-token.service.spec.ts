import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { User } from 'src/engine/core-modules/user/user.entity';

import { RenewTokenService } from './renew-token.service';

describe('RenewTokenService', () => {
  let service: RenewTokenService;
  let appTokenRepository: Repository<AppToken>;
  let accessTokenService: AccessTokenService;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RenewTokenService,
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useClass: Repository,
        },
        {
          provide: AccessTokenService,
          useValue: {
            generateAccessToken: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            verifyRefreshToken: jest.fn(),
            generateRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RenewTokenService>(RenewTokenService);
    appTokenRepository = module.get<Repository<AppToken>>(
      getRepositoryToken(AppToken, 'core'),
    );
    accessTokenService = module.get<AccessTokenService>(AccessTokenService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokensFromRefreshToken', () => {
    it('should generate new access and refresh tokens', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      const mockUser = { id: 'user-id' } as User;
      const mockWorkspaceId = 'workspace-id';
      const mockTokenId = 'token-id';
      const mockAccessToken = {
        token: 'new-access-token',
        expiresAt: new Date(),
      };
      const mockNewRefreshToken = {
        token: 'new-refresh-token',
        expiresAt: new Date(),
      };
      const mockAppToken: Partial<AppToken> = {
        id: mockTokenId,
        workspaceId: mockWorkspaceId,
        user: mockUser,
        userId: mockUser.id,
      };

      jest.spyOn(refreshTokenService, 'verifyRefreshToken').mockResolvedValue({
        user: mockUser,
        token: mockAppToken as AppToken,
      });
      jest.spyOn(appTokenRepository, 'update').mockResolvedValue({} as any);
      jest
        .spyOn(accessTokenService, 'generateAccessToken')
        .mockResolvedValue(mockAccessToken);
      jest
        .spyOn(refreshTokenService, 'generateRefreshToken')
        .mockResolvedValue(mockNewRefreshToken);

      const result =
        await service.generateTokensFromRefreshToken(mockRefreshToken);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockNewRefreshToken,
      });
      expect(refreshTokenService.verifyRefreshToken).toHaveBeenCalledWith(
        mockRefreshToken,
      );
      expect(appTokenRepository.update).toHaveBeenCalledWith(
        { id: mockTokenId },
        { revokedAt: expect.any(Date) },
      );
      expect(accessTokenService.generateAccessToken).toHaveBeenCalledWith(
        mockUser.id,
        mockWorkspaceId,
      );
      expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockWorkspaceId,
      );
    });

    it('should throw an error if refresh token is not provided', async () => {
      await expect(service.generateTokensFromRefreshToken('')).rejects.toThrow(
        AuthException,
      );
    });
  });
});
