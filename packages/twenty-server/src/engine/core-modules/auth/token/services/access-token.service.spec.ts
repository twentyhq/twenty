import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { type Request } from 'express';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

import { AccessTokenService } from './access-token.service';

describe('AccessTokenService', () => {
  let service: AccessTokenService;
  let jwtWrapperService: JwtWrapperService;
  let twentyConfigService: TwentyConfigService;
  let userRepository: Repository<UserEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            sign: jest.fn(),
            verifyJwtToken: jest.fn(),
            decode: jest.fn(),
            generateAppSecret: jest.fn(),
            extractJwtFromRequest: jest.fn(),
          },
        },
        {
          provide: JwtAuthStrategy,
          useValue: {
            validate: jest.fn(),
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
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useClass: Repository,
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest.fn(),
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((_authContext: any, fn: () => any) => fn()),
          },
        },
      ],
    }).compile();

    service = module.get<AccessTokenService>(AccessTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
    globalWorkspaceOrmManager = module.get<GlobalWorkspaceOrmManager>(
      GlobalWorkspaceOrmManager,
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token successfully', async () => {
      const userId = randomUUID();
      const workspaceId = randomUUID();
      const mockUser = {
        id: userId,
      };
      const mockWorkspace = {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        id: workspaceId,
      };
      const mockUserWorkspace = { id: randomUUID() };
      const mockWorkspaceMember = { id: randomUUID() };
      const mockToken = 'mock-token';

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(userWorkspaceRepository, 'findOne')
        .mockResolvedValue(mockUserWorkspace as UserWorkspaceEntity);
      jest.spyOn(globalWorkspaceOrmManager, 'getRepository').mockResolvedValue({
        findOne: jest.fn().mockResolvedValue(mockWorkspaceMember),
      } as any);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateAccessToken({
        userId,
        workspaceId,
        authProvider: AuthProviderEnum.Password,
      });

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: userId,
          workspaceId: workspaceId,
          workspaceMemberId: mockWorkspaceMember.id,
        }),
        expect.any(Object),
      );
    });

    it('embeds impersonation claims when provided', async () => {
      const userId = randomUUID();
      const workspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();
      const impersonatedUserWorkspaceId = randomUUID();
      const mockUser = { id: userId } as UserEntity;
      const mockWorkspace = {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        id: workspaceId,
      } as WorkspaceEntity;
      const mockUserWorkspace = {
        id: impersonatedUserWorkspaceId,
      } as UserWorkspaceEntity;
      const mockWorkspaceMember = { id: randomUUID() };
      const mockToken = 'mock-token';

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(userWorkspaceRepository, 'findOne')
        .mockResolvedValueOnce(mockUserWorkspace as UserWorkspaceEntity)
        .mockResolvedValueOnce({
          id: impersonatorUserWorkspaceId,
          workspaceId,
        } as UserWorkspaceEntity)
        .mockResolvedValueOnce({
          id: impersonatedUserWorkspaceId,
          workspaceId,
        } as UserWorkspaceEntity);
      jest.spyOn(globalWorkspaceOrmManager, 'getRepository').mockResolvedValue({
        findOne: jest.fn().mockResolvedValue(mockWorkspaceMember),
      } as any);
      const signSpy = jest
        .spyOn(jwtWrapperService, 'sign')
        .mockReturnValue(mockToken);

      await service.generateAccessToken({
        userId,
        workspaceId,
        authProvider: AuthProviderEnum.Impersonation,
        isImpersonating: true,
        impersonatorUserWorkspaceId: impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: impersonatedUserWorkspaceId,
      });

      expect(signSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isImpersonating: true,
          impersonatorUserWorkspaceId: impersonatorUserWorkspaceId,
          impersonatedUserWorkspaceId: impersonatedUserWorkspaceId,
        }),
        expect.any(Object),
      );
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.generateAccessToken({
          userId: 'non-existent-user',
          workspaceId: 'workspace-id',
          authProvider: AuthProviderEnum.Password,
        }),
      ).rejects.toThrow(AuthException);
    });
  });

  describe('validateToken', () => {
    it('should validate a token successfully', async () => {
      const mockToken = 'valid-token';
      const mockRequest = {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      } as Request;
      const mockDecodedToken = { sub: 'user-id', workspaceId: 'workspace-id' };
      const mockAuthContext = {
        user: { id: 'user-id' },
        apiKey: null,
        workspace: { id: 'workspace-id' },
        workspaceMemberId: 'workspace-member-id',
      };

      jest
        .spyOn(jwtWrapperService, 'extractJwtFromRequest')
        .mockReturnValue(() => mockToken);
      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(undefined);
      jest
        .spyOn(jwtWrapperService, 'decode')
        .mockReturnValue(mockDecodedToken as any);
      jest
        .spyOn(service['jwtStrategy'], 'validate')
        .mockReturnValue(mockAuthContext as any);

      const result = await service.validateTokenByRequest(mockRequest);

      expect(result).toEqual(mockAuthContext);
      expect(jwtWrapperService.verifyJwtToken).toHaveBeenCalledWith(mockToken);
      expect(jwtWrapperService.decode).toHaveBeenCalledWith(mockToken);
      expect(service['jwtStrategy'].validate).toHaveBeenCalledWith(
        mockDecodedToken,
      );
    });

    it('should throw an error if token is missing', async () => {
      const mockRequest = {
        headers: {},
      } as Request;

      jest
        .spyOn(jwtWrapperService, 'extractJwtFromRequest')
        .mockReturnValue(() => null);

      await expect(service.validateTokenByRequest(mockRequest)).rejects.toThrow(
        AuthException,
      );
    });
  });
});
