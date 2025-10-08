import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { type Request } from 'express';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

import { AccessTokenService } from './access-token.service';

describe('AccessTokenService', () => {
  let service: AccessTokenService;
  let jwtWrapperService: JwtWrapperService;
  let twentyConfigService: TwentyConfigService;
  let userService: UserService;
  let workspaceRepository: Repository<Workspace>;
  let twentyORMGlobalManager: TwentyORMGlobalManager;
  let userWorkspaceRepository: Repository<UserWorkspace>;

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
          provide: UserService,
          useValue: {
            findUserByIdOrThrow: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AppToken),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Workspace),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserWorkspace),
          useClass: Repository,
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccessTokenService>(AccessTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    userService = module.get<UserService>(UserService);
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace),
    );
    twentyORMGlobalManager = module.get<TwentyORMGlobalManager>(
      TwentyORMGlobalManager,
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspace>>(
      getRepositoryToken(UserWorkspace),
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
        .spyOn(userService, 'findUserByIdOrThrow')
        .mockResolvedValue(mockUser as User);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as Workspace);
      jest
        .spyOn(userWorkspaceRepository, 'findOne')
        .mockResolvedValue(mockUserWorkspace as UserWorkspace);
      jest
        .spyOn(twentyORMGlobalManager, 'getRepositoryForWorkspace')
        .mockResolvedValue({
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
      const mockUser = { id: userId } as User;
      const mockWorkspace = {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        id: workspaceId,
      } as Workspace;
      const mockUserWorkspace = {
        id: impersonatedUserWorkspaceId,
      } as UserWorkspace;
      const mockWorkspaceMember = { id: randomUUID() };
      const mockToken = 'mock-token';

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');
      jest
        .spyOn(userService, 'findUserByIdOrThrow')
        .mockResolvedValue(mockUser as User);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as Workspace);
      jest
        .spyOn(userWorkspaceRepository, 'findOne')
        .mockResolvedValueOnce(mockUserWorkspace as UserWorkspace)
        .mockResolvedValueOnce({
          id: impersonatorUserWorkspaceId,
          workspaceId,
        } as UserWorkspace)
        .mockResolvedValueOnce({
          id: impersonatedUserWorkspaceId,
          workspaceId,
        } as UserWorkspace);
      jest
        .spyOn(twentyORMGlobalManager, 'getRepositoryForWorkspace')
        .mockResolvedValue({
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
      jest
        .spyOn(userService, 'findUserByIdOrThrow')
        .mockRejectedValue(
          new AuthException(
            'User is not found',
            AuthExceptionCode.USER_NOT_FOUND,
          ),
        );

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
      expect(jwtWrapperService.verifyJwtToken).toHaveBeenCalledWith(
        mockToken,
        'ACCESS',
      );
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
