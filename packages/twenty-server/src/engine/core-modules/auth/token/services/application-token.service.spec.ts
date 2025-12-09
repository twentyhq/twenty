import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { Repository } from 'typeorm';

import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { WorkspaceException } from 'src/engine/core-modules/workspace/workspace.exception';

describe('ApplicationTokenService', () => {
  let service: ApplicationTokenService;
  let jwtWrapperService: JwtWrapperService;
  let userRepository: Repository<UserEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let twentyORMGlobalManager: TwentyORMGlobalManager;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let applicationRepository: Repository<ApplicationEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTokenService,
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
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
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
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationTokenService>(ApplicationTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    applicationRepository = module.get<Repository<ApplicationEntity>>(
      getRepositoryToken(ApplicationEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
    twentyORMGlobalManager = module.get<TwentyORMGlobalManager>(
      TwentyORMGlobalManager,
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateApplicationToken', () => {
    it('should generate an application token successfully', async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const applicationId = 'application-id';
      const mockUser = { id: userId };
      const mockWorkspace = { id: workspaceId };
      const mockUserWorkspace = { id: randomUUID() };
      const mockWorkspaceMember = { id: randomUUID() };
      const mockApplication = { id: applicationId };
      const mockToken = 'mock-token';

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(userWorkspaceRepository, 'findOne')
        .mockResolvedValue(mockUserWorkspace as UserWorkspaceEntity);
      jest
        .spyOn(applicationRepository, 'findOne')
        .mockResolvedValue(mockApplication as ApplicationEntity);
      jest
        .spyOn(twentyORMGlobalManager, 'getRepositoryForWorkspace')
        .mockResolvedValue({
          findOne: jest.fn().mockResolvedValue(mockWorkspaceMember),
        } as any);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateApplicationToken({
        userId,
        workspaceId,
        applicationId,
        expiresInSeconds: 10,
      });

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: applicationId,
          applicationId,
          workspaceId: workspaceId,
          workspaceMemberId: mockWorkspaceMember.id,
          userId,
        }),
        expect.any(Object),
      );
    });

    it('should handle missing userId successfully', async () => {
      const userId = undefined;
      const workspaceId = 'workspace-id';
      const applicationId = 'application-id';
      const mockWorkspace = { id: workspaceId };
      const mockUserWorkspace = { id: randomUUID() };
      const mockWorkspaceMember = { id: randomUUID() };
      const mockApplication = { id: applicationId };
      const mockToken = 'mock-token';

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(userWorkspaceRepository, 'findOne')
        .mockResolvedValue(mockUserWorkspace as UserWorkspaceEntity);
      jest
        .spyOn(applicationRepository, 'findOne')
        .mockResolvedValue(mockApplication as ApplicationEntity);
      jest
        .spyOn(twentyORMGlobalManager, 'getRepositoryForWorkspace')
        .mockResolvedValue({
          findOne: jest.fn().mockResolvedValue(mockWorkspaceMember),
        } as any);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateApplicationToken({
        userId,
        workspaceId,
        applicationId,
        expiresInSeconds: 10,
      });

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: applicationId,
          applicationId,
          workspaceId: workspaceId,
        }),
        expect.any(Object),
      );
    });
  });

  it('should throw an error if application is not found', async () => {
    const workspaceId = 'workspace-id';

    const mockWorkspace = { id: workspaceId };

    jest.spyOn(applicationRepository, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(workspaceRepository, 'findOne')
      .mockResolvedValue(mockWorkspace as WorkspaceEntity);

    await expect(
      service.generateApplicationToken({
        applicationId: 'non-existent-application',
        workspaceId: 'workspace-id',
        expiresInSeconds: 10,
      }),
    ).rejects.toThrow(ApplicationException);
  });

  it('should throw an error if workspace is not found', async () => {
    jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(null);

    await expect(
      service.generateApplicationToken({
        applicationId: 'application-id',
        workspaceId: 'non-existent-workspace',
        expiresInSeconds: 10,
      }),
    ).rejects.toThrow(WorkspaceException);
  });
});
