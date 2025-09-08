import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AppToken, AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';

import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let jwtWrapperService: JwtWrapperService;
  let twentyConfigService: TwentyConfigService;
  let appTokenRepository: Repository<AppToken>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            verifyJwtToken: jest.fn(),
            decode: jest.fn(),
            sign: jest.fn(),
            generateAppSecret: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AppToken),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    appTokenRepository = module.get<Repository<AppToken>>(
      getRepositoryToken(AppToken),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyRefreshToken', () => {
    it('should verify a refresh token successfully', async () => {
      const mockToken = 'valid-refresh-token';
      const mockJwtPayload = {
        jti: 'token-id',
        sub: 'user-id',
      };
      const mockAppToken = {
        id: 'token-id',
        workspaceId: 'workspace-id',
        revokedAt: null,
      };
      const mockUser: Partial<User> = {
        id: 'some-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        defaultAvatarUrl: '',
      };

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(undefined);
      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockJwtPayload);
      jest
        .spyOn(appTokenRepository, 'findOneBy')
        .mockResolvedValue(mockAppToken as AppToken);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');

      const result = await service.verifyRefreshToken(mockToken);

      expect(result).toEqual({ user: mockUser, token: mockAppToken });
      expect(jwtWrapperService.verifyJwtToken).toHaveBeenCalledWith(
        mockToken,
        'REFRESH',
      );
    });

    it('should throw an error if the token is malformed', async () => {
      const mockToken = 'invalid-token';

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(undefined);
      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue({});

      await expect(service.verifyRefreshToken(mockToken)).rejects.toThrow(
        AuthException,
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token successfully', async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const mockToken = 'mock-refresh-token';
      const mockExpiresIn = '7d';

      jest.spyOn(twentyConfigService, 'get').mockReturnValue(mockExpiresIn);
      jest
        .spyOn(jwtWrapperService, 'generateAppSecret')
        .mockReturnValue('mock-secret');
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);
      jest
        .spyOn(appTokenRepository, 'create')
        .mockReturnValue({ id: 'new-token-id' } as AppToken);
      jest
        .spyOn(appTokenRepository, 'save')
        .mockResolvedValue({ id: 'new-token-id' } as AppToken);

      const result = await service.generateRefreshToken({
        userId,
        workspaceId,
        targetedTokenType: JwtTokenTypeEnum.ACCESS,
      });

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(appTokenRepository.save).toHaveBeenCalled();
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          workspaceId,
          type: 'REFRESH',
          userId: 'user-id',
          targetedTokenType: 'ACCESS',
        },
        expect.objectContaining({
          secret: 'mock-secret',
          expiresIn: mockExpiresIn,
          jwtid: 'new-token-id',
        }),
      );
    });

    it('should throw an error if expiration time is not set', async () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(undefined);

      await expect(
        service.generateRefreshToken({
          userId: 'user-id',
          workspaceId: 'workspace-id',
          targetedTokenType: JwtTokenTypeEnum.ACCESS,
        }),
      ).rejects.toThrow(AuthException);
    });
  });

  it('returns impersonation claims from verified refresh token', async () => {
    const refreshToken = 'rtok';
    const userId = 'user-id';
    const tokenId = 'token-id';

    (jwtWrapperService.verifyJwtToken as jest.Mock).mockResolvedValue(undefined);
    (jwtWrapperService.decode as jest.Mock).mockReturnValue({
      sub: userId,
      jti: tokenId,
      type: 'REFRESH',
      targetedTokenType: 'ACCESS',
      isImpersonating: true,
      impersonationType: 'WORKSPACE',
      impersonatorUserWorkspaceId: 'uw-imp',
      originalUserWorkspaceId: 'uw-orig',
    });

    jest.spyOn(appTokenRepository, 'findOneBy').mockResolvedValue({
      id: tokenId,
      type: AppTokenType.RefreshToken,
    } as any);

    jest.spyOn(userRepository, 'findOne').mockResolvedValue({
      id: userId,
      appTokens: [],
    } as any);

    const out = await service.verifyRefreshToken(refreshToken);

    expect(out.isImpersonating).toBe(true);
    expect(out.impersonationType).toBe('WORKSPACE');
    expect(out.impersonatorUserWorkspaceId).toBe('uw-imp');
    expect(out.originalUserWorkspaceId).toBe('uw-orig');
  });

  it('throws on malformed refresh token', async () => {
    (jwtWrapperService.verifyJwtToken as jest.Mock).mockResolvedValue(undefined);
    (jwtWrapperService.decode as jest.Mock).mockReturnValue({});

    await expect(service.verifyRefreshToken('rtok')).rejects.toThrow(AuthException);
  });
});
