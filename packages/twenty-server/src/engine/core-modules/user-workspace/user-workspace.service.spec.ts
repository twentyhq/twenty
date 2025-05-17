import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DataSource, IsNull, Not, Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

describe('UserWorkspaceService', () => {
  let service: UserWorkspaceService;
  let userWorkspaceRepository: Repository<UserWorkspace>;
  let userRepository: Repository<User>;
  let objectMetadataRepository: Repository<ObjectMetadataEntity>;
  let typeORMService: TypeORMService;
  let workspaceInvitationService: WorkspaceInvitationService;
  let workspaceEventEmitter: WorkspaceEventEmitter;
  let domainManagerService: DomainManagerService;
  let twentyORMGlobalManager: TwentyORMGlobalManager;
  let userRoleService: UserRoleService;
  let fileService: FileService;
  let fileUploadService: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserWorkspaceService,
        {
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            countBy: jest.fn(),
            exists: jest.fn(),
            findOne: jest.fn(),
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity, 'metadata'),
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: DataSourceService,
          useValue: {
            getLastDataSourceMetadataFromWorkspaceIdOrFail: jest.fn(),
          },
        },
        {
          provide: TypeORMService,
          useValue: {
            getMainDataSource: jest.fn(),
          },
        },
        {
          provide: WorkspaceInvitationService,
          useValue: {
            invalidateWorkspaceInvitation: jest.fn(),
          },
        },
        {
          provide: WorkspaceEventEmitter,
          useValue: {
            emitCustomBatchEvent: jest.fn(),
            emitDatabaseBatchEvent: jest.fn(),
          },
        },
        {
          provide: DomainManagerService,
          useValue: {
            getWorkspaceUrls: jest.fn(),
          },
        },
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest.fn(),
          },
        },
        {
          provide: UserRoleService,
          useValue: {
            assignRoleToUserWorkspace: jest.fn(),
          },
        },
        {
          provide: FileStorageService,
          useValue: {
            copy: jest.fn(),
          },
        },
        {
          provide: FileUploadService,
          useValue: {
            uploadImageFromUrl: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            copyFileToNewWorkspace: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserWorkspaceService>(UserWorkspaceService);
    fileService = module.get<FileService>(FileService);
    userWorkspaceRepository = module.get(
      getRepositoryToken(UserWorkspace, 'core'),
    );
    userRepository = module.get(getRepositoryToken(User, 'core'));
    objectMetadataRepository = module.get(
      getRepositoryToken(ObjectMetadataEntity, 'metadata'),
    );
    typeORMService = module.get<TypeORMService>(TypeORMService);
    workspaceInvitationService = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
    workspaceEventEmitter = module.get<WorkspaceEventEmitter>(
      WorkspaceEventEmitter,
    );
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
    twentyORMGlobalManager = module.get<TwentyORMGlobalManager>(
      TwentyORMGlobalManager,
    );
    userRoleService = module.get<UserRoleService>(UserRoleService);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it("should create a user workspace with a default avatar url if it's an existing user with a user workspace having a default avatar url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = { userId, workspaceId } as UserWorkspace;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);
      jest.spyOn(userWorkspaceRepository, 'findOne').mockResolvedValue({
        defaultAvatarUrl: 'path/to/file',
      } as UserWorkspace);
      jest
        .spyOn(fileService, 'copyFileToNewWorkspace')
        .mockResolvedValue(['', 'path/to', 'copy']);
      jest
        .spyOn(workspaceEventEmitter, 'emitCustomBatchEvent')
        .mockImplementation();

      const result = await service.create({
        userId,
        workspaceId,
        isExistingUser: true,
      });

      expect(userWorkspaceRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          defaultAvatarUrl: Not(IsNull()),
        },
        order: {
          createdAt: 'ASC',
        },
      });

      expect(userWorkspaceRepository.create).toHaveBeenCalledWith({
        userId,
        workspaceId,
        defaultAvatarUrl: 'path/to/copy',
      });

      expect(userWorkspaceRepository.save).toHaveBeenCalledWith(userWorkspace);
      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        USER_SIGNUP_EVENT_NAME,
        [{ userId }],
        workspaceId,
      );
      expect(result).toEqual(userWorkspace);
    });
    it("should create a user workspace without a default avatar url if it's an existing user without any user workspace having a default avatar url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = { userId, workspaceId } as UserWorkspace;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);

      jest.spyOn(userWorkspaceRepository, 'findOne').mockResolvedValue(null);

      jest
        .spyOn(workspaceEventEmitter, 'emitCustomBatchEvent')
        .mockImplementation();

      const result = await service.create({
        userId,
        workspaceId,
        isExistingUser: true,
      });

      expect(userWorkspaceRepository.create).toHaveBeenCalledWith({
        userId,
        workspaceId,
        defaultAvatarUrl: undefined,
      });
      expect(userWorkspaceRepository.save).toHaveBeenCalledWith(userWorkspace);
      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        USER_SIGNUP_EVENT_NAME,
        [{ userId }],
        workspaceId,
      );
      expect(result).toEqual(userWorkspace);
    });
    it("should create a user workspace with a default avatar url if it's a new user with a picture url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = { userId, workspaceId } as UserWorkspace;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);

      jest
        .spyOn(workspaceEventEmitter, 'emitCustomBatchEvent')
        .mockImplementation();
      jest.spyOn(fileUploadService, 'uploadImageFromUrl').mockResolvedValue({
        paths: ['path/to/file'],
      } as any);

      const result = await service.create({
        userId,
        workspaceId,
        isExistingUser: false,
        pictureUrl: 'picture-url',
      });

      expect(fileUploadService.uploadImageFromUrl).toHaveBeenCalledWith({
        imageUrl: 'picture-url',
        fileFolder: FileFolder.ProfilePicture,
        workspaceId,
      });
      expect(userWorkspaceRepository.create).toHaveBeenCalledWith({
        userId,
        workspaceId,
        defaultAvatarUrl: 'path/to/file',
      });
      expect(userWorkspaceRepository.save).toHaveBeenCalledWith(userWorkspace);
      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        USER_SIGNUP_EVENT_NAME,
        [{ userId }],
        workspaceId,
      );
      expect(result).toEqual(userWorkspace);
    });
    it("should create a user workspace without a default avatar url if it's a new user without a picture url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = { userId, workspaceId } as UserWorkspace;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);
      jest
        .spyOn(workspaceEventEmitter, 'emitCustomBatchEvent')
        .mockImplementation();

      const result = await service.create({
        userId,
        workspaceId,
        isExistingUser: false,
        pictureUrl: undefined,
      });

      expect(userWorkspaceRepository.create).toHaveBeenCalledWith({
        userId,
        workspaceId,
        defaultAvatarUrl: undefined,
      });
      expect(userWorkspaceRepository.save).toHaveBeenCalledWith(userWorkspace);
      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        USER_SIGNUP_EVENT_NAME,
        [{ userId }],
        workspaceId,
      );
      expect(result).toEqual(userWorkspace);
    });
  });

  describe('createWorkspaceMember', () => {
    it('should create a workspace member', async () => {
      const workspaceId = 'workspace-id';
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        defaultAvatarUrl: 'avatar-url',
        locale: 'en',
      } as User;
      const mainDataSource = {
        query: jest.fn(),
      } as unknown as DataSource;
      const workspaceMember = [
        {
          id: 'workspace-member-id',
          nameFirstName: 'John',
          nameLastName: 'Doe',
          userId: 'user-id',
          userEmail: 'test@example.com',
        },
      ];
      const objectMetadata = {
        nameSingular: 'workspaceMember',
      } as ObjectMetadataEntity;
      const workspaceMemberRepository = {
        insert: jest.fn(),
        find: jest.fn().mockResolvedValue(workspaceMember),
      };

      jest
        .spyOn(typeORMService, 'getMainDataSource')
        .mockReturnValue(mainDataSource);
      jest
        .spyOn(mainDataSource, 'query')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(workspaceMember);
      jest
        .spyOn(objectMetadataRepository, 'findOneOrFail')
        .mockResolvedValue(objectMetadata);
      jest
        .spyOn(workspaceEventEmitter, 'emitDatabaseBatchEvent')
        .mockImplementation();

      jest
        .spyOn(twentyORMGlobalManager, 'getRepositoryForWorkspace')
        .mockResolvedValue(workspaceMemberRepository as any);

      jest.spyOn(userWorkspaceRepository, 'findOneOrFail').mockResolvedValue({
        defaultAvatarUrl: 'userWorkspace-avatar-url',
      } as UserWorkspace);

      await service.createWorkspaceMember(workspaceId, user);

      expect(workspaceMemberRepository.insert).toHaveBeenCalledWith({
        name: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        colorScheme: 'System',
        userId: user.id,
        userEmail: user.email,
        locale: 'en',
        avatarUrl: 'userWorkspace-avatar-url',
      });
      expect(objectMetadataRepository.findOneOrFail).toHaveBeenCalledWith({
        where: {
          nameSingular: 'workspaceMember',
          workspaceId,
        },
      });
      expect(workspaceEventEmitter.emitDatabaseBatchEvent).toHaveBeenCalledWith(
        {
          objectMetadataNameSingular: 'workspaceMember',
          action: DatabaseEventAction.CREATED,
          events: [
            {
              recordId: workspaceMember[0].id,
              objectMetadata,
              properties: {
                after: workspaceMember[0],
              },
            },
          ],
          workspaceId,
        },
      );
    });
  });

  describe('addUserToWorkspaceIfUserNotInWorkspace', () => {
    it('should add user to workspace if not already in workspace', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
      } as User;
      const workspace = {
        id: 'workspace-id',
        defaultRoleId: 'default-role-id',
      } as Workspace;
      const userWorkspace = {
        id: 'user-workspace-id',
        userId: user.id,
        workspaceId: workspace.id,
      } as UserWorkspace;

      jest.spyOn(service, 'checkUserWorkspaceExists').mockResolvedValue(null);
      jest.spyOn(service, 'create').mockResolvedValue(userWorkspace);
      jest.spyOn(service, 'createWorkspaceMember').mockResolvedValue(undefined);
      jest
        .spyOn(userRoleService, 'assignRoleToUserWorkspace')
        .mockResolvedValue(undefined);
      jest
        .spyOn(workspaceInvitationService, 'invalidateWorkspaceInvitation')
        .mockResolvedValue(undefined);

      await service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace);

      expect(service.checkUserWorkspaceExists).toHaveBeenCalledWith(
        user.id,
        workspace.id,
      );
      expect(service.create).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        userId: user.id,
        isExistingUser: true,
      });
      expect(service.createWorkspaceMember).toHaveBeenCalledWith(
        workspace.id,
        user,
      );
      expect(userRoleService.assignRoleToUserWorkspace).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        userWorkspaceId: userWorkspace.id,
        roleId: workspace.defaultRoleId,
      });
      expect(
        workspaceInvitationService.invalidateWorkspaceInvitation,
      ).toHaveBeenCalledWith(workspace.id, user.email);
    });

    it('should not add user to workspace if already in workspace', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
      } as User;
      const workspace = {
        id: 'workspace-id',
        defaultRoleId: 'default-role-id',
      } as Workspace;
      const userWorkspace = {
        id: 'user-workspace-id',
        userId: user.id,
        workspaceId: workspace.id,
      } as UserWorkspace;

      jest
        .spyOn(service, 'checkUserWorkspaceExists')
        .mockResolvedValue(userWorkspace);
      jest.spyOn(service, 'create').mockResolvedValue(userWorkspace);
      jest.spyOn(service, 'createWorkspaceMember').mockResolvedValue(undefined);

      await service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace);

      expect(service.checkUserWorkspaceExists).toHaveBeenCalledWith(
        user.id,
        workspace.id,
      );
      expect(service.create).not.toHaveBeenCalled();
      expect(service.createWorkspaceMember).not.toHaveBeenCalled();
    });

    it('should throw an exception if workspace has no default role', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
      } as User;
      const workspace = {
        id: 'workspace-id',
        defaultRoleId: undefined,
      } as unknown as Workspace;

      jest.spyOn(service, 'checkUserWorkspaceExists').mockResolvedValue(null);
      jest.spyOn(service, 'create').mockResolvedValue({} as UserWorkspace);
      jest.spyOn(service, 'createWorkspaceMember').mockResolvedValue(undefined);

      await expect(
        service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace),
      ).rejects.toThrow(PermissionsException);
    });
  });

  describe('getUserCount', () => {
    it('should return the count of users in a workspace', async () => {
      const workspaceId = 'workspace-id';
      const count = 5;

      jest.spyOn(userWorkspaceRepository, 'countBy').mockResolvedValue(count);

      const result = await service.getUserCount(workspaceId);

      expect(userWorkspaceRepository.countBy).toHaveBeenCalledWith({
        workspaceId,
      });
      expect(result).toEqual(count);
    });
  });

  describe('checkUserWorkspaceExists', () => {
    it('should check if a user workspace exists', async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = { userId, workspaceId } as UserWorkspace;

      jest
        .spyOn(userWorkspaceRepository, 'findOneBy')
        .mockResolvedValue(userWorkspace);

      const result = await service.checkUserWorkspaceExists(
        userId,
        workspaceId,
      );

      expect(userWorkspaceRepository.findOneBy).toHaveBeenCalledWith({
        userId,
        workspaceId,
      });
      expect(result).toEqual(userWorkspace);
    });

    it('should return null if user workspace does not exist', async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(userWorkspaceRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.checkUserWorkspaceExists(
        userId,
        workspaceId,
      );

      expect(userWorkspaceRepository.findOneBy).toHaveBeenCalledWith({
        userId,
        workspaceId,
      });
      expect(result).toBeNull();
    });
  });

  describe('checkUserWorkspaceExistsByEmail', () => {
    it('should check if a user workspace exists by email', async () => {
      const email = 'test@example.com';
      const workspaceId = 'workspace-id';

      jest.spyOn(userWorkspaceRepository, 'exists').mockResolvedValue(true);

      const result = await service.checkUserWorkspaceExistsByEmail(
        email,
        workspaceId,
      );

      expect(userWorkspaceRepository.exists).toHaveBeenCalledWith({
        where: {
          workspaceId,
          user: {
            email,
          },
        },
        relations: {
          user: true,
        },
      });
      expect(result).toBe(true);
    });
  });

  describe('findAvailableWorkspacesByEmail', () => {
    it('should find available workspaces for an email', async () => {
      const email = 'test@example.com';
      const workspace1 = {
        id: 'workspace-id-1',
        displayName: 'Workspace 1',
        logo: 'logo1.png',
        workspaceSSOIdentityProviders: [
          {
            id: 'sso-id-1',
            name: 'SSO Provider 1',
            issuer: 'issuer1',
            type: 'type1',
            status: 'Active',
          },
          {
            id: 'sso-id-2',
            name: 'SSO Provider 2',
            issuer: 'issuer2',
            type: 'type2',
            status: 'Inactive',
          },
        ],
      } as unknown as Workspace;
      const workspace2 = {
        id: 'workspace-id-2',
        displayName: 'Workspace 2',
        logo: 'logo2.png',
        workspaceSSOIdentityProviders: [],
      } as unknown as Workspace;
      const user = {
        email,
        workspaces: [
          {
            workspaceId: workspace1.id,
            workspace: workspace1,
          },
          {
            workspaceId: workspace2.id,
            workspace: workspace2,
          },
        ],
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(domainManagerService, 'getWorkspaceUrls')
        .mockReturnValueOnce({
          customUrl: 'https://crm.custom1.com',
          subdomainUrl: 'https://workspace1.twenty.com',
        })
        .mockReturnValueOnce({
          customUrl: 'https://crm.custom2.com',
          subdomainUrl: 'https://workspace2.twenty.com',
        });

      const result = await service.findAvailableWorkspacesByEmail(email);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email,
        },
        relations: [
          'workspaces',
          'workspaces.workspace',
          'workspaces.workspace.workspaceSSOIdentityProviders',
        ],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: workspace1.id,
        displayName: workspace1.displayName,
        workspaceUrls: {
          customUrl: 'https://crm.custom1.com',
          subdomainUrl: 'https://workspace1.twenty.com',
        },
        logo: workspace1.logo,
        sso: [
          {
            id: 'sso-id-1',
            name: 'SSO Provider 1',
            issuer: 'issuer1',
            type: 'type1',
            status: 'Active',
          },
        ],
      });
      expect(result[1]).toEqual({
        id: workspace2.id,
        displayName: workspace2.displayName,
        workspaceUrls: {
          customUrl: 'https://crm.custom2.com',
          subdomainUrl: 'https://workspace2.twenty.com',
        },
        logo: workspace2.logo,
        sso: [],
      });
    });

    it('should throw an exception if user is not found', async () => {
      const email = 'nonexistent@example.com';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findAvailableWorkspacesByEmail(email),
      ).rejects.toThrow(AuthException);
    });
  });

  describe('findFirstWorkspaceByUserId', () => {
    it('should find the first workspace for a user', async () => {
      const userId = 'user-id';
      const workspace1 = {
        id: 'workspace-id',
        createdAt: '2025-01-02T00:00:00.000Z',
      } as unknown as Workspace;
      const workspace2 = {
        id: 'workspace-id-2',
        createdAt: '2025-01-01T00:00:00.000Z',
      } as unknown as Workspace;
      const user = {
        id: userId,
        workspaces: [{ workspace: workspace1 }, { workspace: workspace2 }],
      } as unknown as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findFirstWorkspaceByUserId(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
        relations: ['workspaces', 'workspaces.workspace'],
        order: {
          workspaces: {
            workspace: {
              createdAt: 'ASC',
            },
          },
        },
      });
      expect(result).toEqual(workspace1);
    });

    it('should throw an exception if no workspace is found', async () => {
      const userId = 'user-id';
      const user = {
        id: userId,
        workspaces: [],
      } as unknown as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.findFirstWorkspaceByUserId(userId)).rejects.toThrow(
        AuthException,
      );
    });
  });

  describe('getUserWorkspaceForUserOrThrow', () => {
    it('should get a user workspace or throw', async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = { userId, workspaceId } as UserWorkspace;

      jest
        .spyOn(userWorkspaceRepository, 'findOne')
        .mockResolvedValue(userWorkspace);

      const result = await service.getUserWorkspaceForUserOrThrow({
        userId,
        workspaceId,
      });

      expect(userWorkspaceRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          workspaceId,
        },
      });
      expect(result).toEqual(userWorkspace);
    });

    it('should throw an exception if user workspace is not found', async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(userWorkspaceRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getUserWorkspaceForUserOrThrow({ userId, workspaceId }),
      ).rejects.toThrow('User workspace not found');
    });
  });

  describe('getWorkspaceMemberOrThrow', () => {
    it('should get a workspace member or throw', async () => {
      const workspaceMemberId = 'workspace-member-id';
      const workspaceId = 'workspace-id';
      const workspaceMember = {
        id: workspaceMemberId,
      } as WorkspaceMemberWorkspaceEntity;
      const workspaceMemberRepository = {
        findOne: jest.fn().mockResolvedValue(workspaceMember),
      };

      jest
        .spyOn(twentyORMGlobalManager, 'getRepositoryForWorkspace')
        .mockResolvedValue(workspaceMemberRepository as any);

      const result = await service.getWorkspaceMemberOrThrow({
        workspaceMemberId,
        workspaceId,
      });

      expect(
        twentyORMGlobalManager.getRepositoryForWorkspace,
      ).toHaveBeenCalledWith(workspaceId, 'workspaceMember');
      expect(workspaceMemberRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: workspaceMemberId,
        },
      });
      expect(result).toEqual(workspaceMember);
    });

    it('should throw an exception if workspace member is not found', async () => {
      const workspaceMemberId = 'workspace-member-id';
      const workspaceId = 'workspace-id';
      const workspaceMemberRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(twentyORMGlobalManager, 'getRepositoryForWorkspace')
        .mockResolvedValue(workspaceMemberRepository as any);

      await expect(
        service.getWorkspaceMemberOrThrow({ workspaceMemberId, workspaceId }),
      ).rejects.toThrow('Workspace member not found');
    });
  });
});
