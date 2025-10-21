import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

import { RenewTokenService } from './renew-token.service';

describe('RenewTokenService', () => {
  let service: RenewTokenService;
  let appTokenRepository: Repository<AppTokenEntity>;
  let accessTokenService: AccessTokenService;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RenewTokenService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useClass: Repository,
        },
        {
          provide: AccessTokenService,
          useValue: {
            generateAccessToken: jest.fn(),
          },
        },
        {
          provide: WorkspaceAgnosticTokenService,
          useValue: {
            generateWorkspaceAgnosticToken: jest.fn(),
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
    appTokenRepository = module.get<Repository<AppTokenEntity>>(
      getRepositoryToken(AppTokenEntity),
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
      const mockUser = { id: 'user-id' } as UserEntity;
      const mockWorkspaceId = 'workspace-id';
      const mockTokenId = 'token-id';
      const mockAccessToken = {
        token: 'new-access-token',
        expiresAt: new Date(),
      };
      const mockNewRefreshToken = {
        token: 'new-refresh-token',
        expiresAt: new Date(),
        targetedTokenType: JwtTokenTypeEnum.ACCESS,
      };
      const mockAppToken: Partial<AppTokenEntity> = {
        id: mockTokenId,
        workspaceId: mockWorkspaceId,
      } as AppTokenEntity;

      jest.spyOn(refreshTokenService, 'verifyRefreshToken').mockResolvedValue({
        user: mockUser,
        token: mockAppToken as AppTokenEntity,
        authProvider: AuthProviderEnum.Password,
        targetedTokenType: JwtTokenTypeEnum.ACCESS,
        isImpersonating: false,
        impersonatorUserWorkspaceId: undefined,
        impersonatedUserWorkspaceId: undefined,
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
        accessOrWorkspaceAgnosticToken: mockAccessToken,
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
        expect.objectContaining({
          userId: mockUser.id,
          workspaceId: mockWorkspaceId,
          authProvider: AuthProviderEnum.Password,
        }),
      );
      expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          authProvider: AuthProviderEnum.Password,
          targetedTokenType: JwtTokenTypeEnum.ACCESS,
          userId: mockUser.id,
          workspaceId: mockWorkspaceId,
        }),
      );
    });

    it('should propagate impersonation claims when present', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      const mockUser = { id: 'user-id' } as UserEntity;
      const mockWorkspaceId = 'workspace-id';
      const mockTokenId = 'token-id';
      const mockAccessToken = {
        token: 'new-access-token',
        expiresAt: new Date(),
      };
      const mockNewRefreshToken = {
        token: 'new-refresh-token',
        expiresAt: new Date(),
        targetedTokenType: JwtTokenTypeEnum.ACCESS,
      };
      const mockAppToken = {
        id: mockTokenId,
        workspaceId: mockWorkspaceId,
      } as AppTokenEntity;

      jest.spyOn(refreshTokenService, 'verifyRefreshToken').mockResolvedValue({
        user: mockUser,
        token: mockAppToken as AppTokenEntity,
        authProvider: AuthProviderEnum.Password,
        targetedTokenType: JwtTokenTypeEnum.ACCESS,
        isImpersonating: true,
        impersonatorUserWorkspaceId: 'uw-imp',
        impersonatedUserWorkspaceId: 'uw-orig',
      });
      jest.spyOn(appTokenRepository, 'update').mockResolvedValue({} as any);
      const accessSpy = jest
        .spyOn(accessTokenService, 'generateAccessToken')
        .mockResolvedValue(mockAccessToken);
      const refreshSpy = jest
        .spyOn(refreshTokenService, 'generateRefreshToken')
        .mockResolvedValue(mockNewRefreshToken);

      await service.generateTokensFromRefreshToken(mockRefreshToken);

      expect(accessSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isImpersonating: true,
          impersonatorUserWorkspaceId: 'uw-imp',
          impersonatedUserWorkspaceId: 'uw-orig',
        }),
      );
      expect(refreshSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isImpersonating: true,
          impersonatorUserWorkspaceId: 'uw-imp',
          impersonatedUserWorkspaceId: 'uw-orig',
        }),
      );
    });

    it('should throw an error if refresh token is not provided', async () => {
      await expect(service.generateTokensFromRefreshToken('')).rejects.toThrow(
        AuthException,
      );
    });
  });
});
