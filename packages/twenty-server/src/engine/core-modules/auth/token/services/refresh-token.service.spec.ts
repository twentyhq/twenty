import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { User } from 'src/engine/core-modules/user/user.entity';

import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let jwtWrapperService: JwtWrapperService;
  let environmentService: EnvironmentService;
  let appTokenRepository: Repository<AppToken>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            verifyWorkspaceToken: jest.fn(),
            decode: jest.fn(),
            sign: jest.fn(),
            generateAppSecret: jest.fn(),
          },
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    appTokenRepository = module.get<Repository<AppToken>>(
      getRepositoryToken(AppToken, 'core'),
    );
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User, 'core'),
    );
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
        .spyOn(jwtWrapperService, 'verifyWorkspaceToken')
        .mockResolvedValue(undefined);
      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockJwtPayload);
      jest
        .spyOn(appTokenRepository, 'findOneBy')
        .mockResolvedValue(mockAppToken as AppToken);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(environmentService, 'get').mockReturnValue('1h');

      const result = await service.verifyRefreshToken(mockToken);

      expect(result).toEqual({ user: mockUser, token: mockAppToken });
      expect(jwtWrapperService.verifyWorkspaceToken).toHaveBeenCalledWith(
        mockToken,
        'REFRESH',
      );
    });

    it('should throw an error if the token is malformed', async () => {
      const mockToken = 'invalid-token';

      jest
        .spyOn(jwtWrapperService, 'verifyWorkspaceToken')
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

      jest.spyOn(environmentService, 'get').mockReturnValue(mockExpiresIn);
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

      const result = await service.generateRefreshToken(userId, workspaceId);

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(appTokenRepository.save).toHaveBeenCalled();
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        { sub: userId, workspaceId },
        expect.objectContaining({
          secret: 'mock-secret',
          expiresIn: mockExpiresIn,
          jwtid: 'new-token-id',
        }),
      );
    });

    it('should throw an error if expiration time is not set', async () => {
      jest.spyOn(environmentService, 'get').mockReturnValue(undefined);

      await expect(
        service.generateRefreshToken('user-id', 'workspace-id'),
      ).rejects.toThrow(AuthException);
    });
  });
});
