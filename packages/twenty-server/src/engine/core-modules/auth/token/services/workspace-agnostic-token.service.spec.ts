import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';

describe('WorkspaceAgnosticToken', () => {
  let service: WorkspaceAgnosticTokenService;
  let jwtWrapperService: JwtWrapperService;
  let twentyConfigService: TwentyConfigService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceAgnosticTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            signAsyncOrThrow: jest.fn(),
            verifyJwtToken: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceAgnosticTokenService>(
      WorkspaceAgnosticTokenService,
    );
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateWorkspaceAgnosticToken', () => {
    it('should generate a workspace agnostic token successfully', async () => {
      const userId = 'user-id';
      const mockExpiresIn = '15m';
      const mockToken = 'mock-token';
      const mockUser = { id: userId };

      jest.spyOn(twentyConfigService, 'get').mockImplementation((key) => {
        if (key === 'WORKSPACE_AGNOSTIC_TOKEN_EXPIRES_IN') return mockExpiresIn;

        return undefined;
      });
      jest
        .spyOn(jwtWrapperService, 'signAsyncOrThrow')
        .mockResolvedValue(mockToken);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);

      const result = await service.generateWorkspaceAgnosticToken({
        userId,
        authProvider: AuthProviderEnum.Password,
      });

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'WORKSPACE_AGNOSTIC_TOKEN_EXPIRES_IN',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(jwtWrapperService.signAsyncOrThrow).toHaveBeenCalledWith(
        {
          authProvider: AuthProviderEnum.Password,
          sub: userId,
          userId: userId,
          type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
        },
        { expiresIn: mockExpiresIn },
      );
    });

    it('should throw an error if user is not found', async () => {
      const userId = 'non-existent-user-id';
      const mockExpiresIn = '15m';

      jest.spyOn(twentyConfigService, 'get').mockImplementation((key) => {
        if (key === 'WORKSPACE_AGNOSTIC_TOKEN_EXPIRES_IN') return mockExpiresIn;

        return undefined;
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.generateWorkspaceAgnosticToken({
          userId,
          authProvider: AuthProviderEnum.Password,
        }),
      ).rejects.toThrow(AuthException);
    });
  });

  describe('validateToken', () => {
    it('should validate a token successfully', async () => {
      const mockToken = 'valid-token';
      const userId = 'user-id';
      const mockPayload = {
        sub: userId,
        userId: userId,
        type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
      };
      const mockUser = {
        id: userId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
      } as unknown as UserEntity;

      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockPayload);
      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(mockPayload);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);

      const result = await service.validateToken(mockToken);

      expect(result.user).toMatchObject({
        id: userId,
      });
      expect(jwtWrapperService.verifyJwtToken).toHaveBeenCalledWith(mockToken);
      expect(jwtWrapperService.decode).toHaveBeenCalledWith(mockToken);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw an error if token verification fails', async () => {
      const mockToken = 'invalid-token';

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.validateToken(mockToken)).rejects.toThrow(
        AuthException,
      );
    });

    it('should throw an error if user is not found', async () => {
      const mockToken = 'valid-token';
      const userId = 'user-id';
      const mockPayload = {
        sub: userId,
        userId: userId,
        type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
      };

      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockPayload);
      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(mockPayload);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.validateToken(mockToken)).rejects.toThrow(
        AuthException,
      );
    });

    it('should reject a valid token that is not of WORKSPACE_AGNOSTIC type', async () => {
      const mockToken = 'valid-but-wrong-type-token';
      const userId = 'user-id';
      const mockPayload = {
        sub: userId,
        userId: userId,
        type: JwtTokenTypeEnum.ACCESS,
      };

      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockPayload);
      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(mockPayload);

      await expect(service.validateToken(mockToken)).rejects.toThrow(
        AuthException,
      );
    });
  });
});
