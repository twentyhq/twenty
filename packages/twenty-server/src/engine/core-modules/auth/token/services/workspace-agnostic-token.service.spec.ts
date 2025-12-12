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
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
            generateAppSecret: jest.fn().mockReturnValue('mocked-secret'),
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
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);
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
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        {
          authProvider: AuthProviderEnum.Password,
          sub: userId,
          userId: userId,
          type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
        },
        expect.objectContaining({
          secret: 'mocked-secret',
          expiresIn: mockExpiresIn,
        }),
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
      const mockUser = { id: userId };

      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockPayload);
      jest.spyOn(jwtWrapperService, 'verify').mockReturnValue({});
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);

      const result = await service.validateToken(mockToken);

      expect(result).toEqual({
        user: mockUser,
      });
      expect(jwtWrapperService.decode).toHaveBeenCalledWith(mockToken);
      expect(jwtWrapperService.verify).toHaveBeenCalledWith(
        mockToken,
        expect.objectContaining({
          secret: 'mocked-secret',
        }),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw an error if token verification fails', async () => {
      const mockToken = 'invalid-token';

      jest.spyOn(jwtWrapperService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

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
      jest.spyOn(jwtWrapperService, 'verify').mockReturnValue({});
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.validateToken(mockToken)).rejects.toThrow(
        AuthException,
      );
    });
  });
});
