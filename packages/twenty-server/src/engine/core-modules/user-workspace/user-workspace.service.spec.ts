import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type DataSource, type Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { type ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  FileUploadService,
  type SignedFilesResult,
} from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

describe('UserWorkspaceService', () => {
  let service: UserWorkspaceService;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let userRepository: Repository<UserEntity>;
  let workspaceInvitationService: WorkspaceInvitationService;
  let approvedAccessDomainService: ApprovedAccessDomainService;
  let globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  let userRoleService: UserRoleService;
  let fileService: FileService;
  let fileUploadService: FileUploadService;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserWorkspaceService,
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
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
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleTargetEntity),
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
          provide: WorkspaceInvitationService,
          useValue: {
            invalidateWorkspaceInvitation: jest.fn(),
            findInvitationsByEmail: jest.fn(),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            getWorkspaceUrls: jest.fn(),
          },
        },
        {
          provide: ApprovedAccessDomainService,
          useValue: {
            findValidatedApprovedAccessDomainWithWorkspacesAndSSOIdentityProvidersDomain:
              jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation(async (_authContext, callback) => callback()),
            getRepository: jest.fn(),
          },
        },
        {
          provide: UserRoleService,
          useValue: {
            assignRoleToManyUserWorkspace: jest.fn(),
          },
        },
        {
          provide: FileStorageService,
          useValue: {
            copy: jest.fn(),
          },
        },
        {
          provide: LoginTokenService,
          useValue: {},
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
            copyFileFromWorkspaceToWorkspace: jest.fn(),
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            setOnboardingCreateProfilePending: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserWorkspaceService>(UserWorkspaceService);
    fileService = module.get<FileService>(FileService);
    userWorkspaceRepository = module.get(
      getRepositoryToken(UserWorkspaceEntity),
    );
    userRepository = module.get(getRepositoryToken(UserEntity));
    workspaceInvitationService = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
    approvedAccessDomainService = module.get<ApprovedAccessDomainService>(
      ApprovedAccessDomainService,
    );
    globalWorkspaceOrmManager = module.get<GlobalWorkspaceOrmManager>(
      GlobalWorkspaceOrmManager,
    );
    (globalWorkspaceOrmManager.getRepository as jest.Mock).mockResolvedValue({
      findOne: jest.fn(),
      update: jest.fn(),
    } as unknown as WorkspaceRepository<UserWorkspaceEntity>);

    userRoleService = module.get<UserRoleService>(UserRoleService);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it("should create a user workspace with a default avatar url if it's an existing user with a user workspace having a default avatar url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = {
        userId,
        workspaceId,
      } as UserWorkspaceEntity;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);
      jest.spyOn(userWorkspaceRepository, 'findOne').mockResolvedValue({
        defaultAvatarUrl: 'path/to/file',
      } as UserWorkspaceEntity);
      jest
        .spyOn(fileService, 'copyFileFromWorkspaceToWorkspace')
        .mockResolvedValue(['', 'path/to', 'copy']);

      const result = await service.create({
        userId,
        workspaceId,
        isExistingUser: true,
      });

      expect(userWorkspaceRepository.create).toHaveBeenCalledWith({
        userId,
        workspaceId,
        defaultAvatarUrl: 'path/to/copy',
      });

      expect(userWorkspaceRepository.save).toHaveBeenCalledWith(userWorkspace);
      expect(result).toEqual(userWorkspace);
    });
    it("should create a user workspace without a default avatar url if it's an existing user without any user workspace having a default avatar url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = {
        userId,
        workspaceId,
      } as UserWorkspaceEntity;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);

      jest.spyOn(userWorkspaceRepository, 'findOne').mockResolvedValue(null);

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
      expect(result).toEqual(userWorkspace);
    });
    it("should create a user workspace with a default avatar url if it's a new user with a picture url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = {
        userId,
        workspaceId,
      } as UserWorkspaceEntity;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);

      jest.spyOn(fileUploadService, 'uploadImageFromUrl').mockResolvedValue({
        files: [{ path: 'path/to/file', token: 'token' }],
      } as SignedFilesResult);

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
      expect(result).toEqual(userWorkspace);
    });
    it("should create a user workspace without a default avatar url if it's a new user without a picture url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = {
        userId,
        workspaceId,
      } as unknown as UserWorkspaceEntity;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);

      const result = await service.create({
        userId,
        workspaceId,
        isExistingUser: false,
        pictureUrl: undefined,
      });

      expect(userWorkspaceRepository.save).toHaveBeenCalledWith(userWorkspace);
      expect(result).toEqual(userWorkspace);
    });

    it("should create a user workspace without a default avatar url if it's a new user with an empty picture url", async () => {
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const userWorkspace = {
        userId,
        workspaceId,
      } as unknown as UserWorkspaceEntity;

      jest
        .spyOn(userWorkspaceRepository, 'create')
        .mockReturnValue(userWorkspace);
      jest
        .spyOn(userWorkspaceRepository, 'save')
        .mockResolvedValue(userWorkspace);

      const uploadImageFromUrlSpy = jest
        .spyOn(fileUploadService, 'uploadImageFromUrl')
        .mockResolvedValue({
          files: [{ path: 'path/to/file', token: 'token' }],
        } as SignedFilesResult);

      const result = await service.create({
        userId,
        workspaceId,
        isExistingUser: false,
        pictureUrl: '',
      });

      expect(uploadImageFromUrlSpy).not.toHaveBeenCalled();

      expect(userWorkspaceRepository.create).toHaveBeenCalledWith({
        userId,
        workspaceId,
        defaultAvatarUrl: undefined,
      });
      expect(userWorkspaceRepository.save).toHaveBeenCalledWith(userWorkspace);
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
      } as UserEntity;
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
      const workspaceMemberRepository = {
        insert: jest.fn(),
        find: jest.fn().mockResolvedValue(workspaceMember),
      };

      jest
        .spyOn(mainDataSource, 'query')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(workspaceMember);
      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(workspaceMemberRepository as any);

      jest.spyOn(userWorkspaceRepository, 'findOneOrFail').mockResolvedValue({
        defaultAvatarUrl: 'userWorkspace-avatar-url',
      } as UserWorkspaceEntity);

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
    });
  });

  describe('addUserToWorkspaceIfUserNotInWorkspace', () => {
    it('should add user to workspace if not already in workspace', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
      } as UserEntity;
      const workspace = {
        id: 'workspace-id',
        defaultRoleId: 'default-role-id',
      } as WorkspaceEntity;
      const userWorkspace = {
        id: 'user-workspace-id',
        userId: user.id,
        workspaceId: workspace.id,
      } as UserWorkspaceEntity;

      jest.spyOn(service, 'checkUserWorkspaceExists').mockResolvedValue(null);
      jest.spyOn(service, 'create').mockResolvedValue(userWorkspace);
      jest.spyOn(service, 'createWorkspaceMember').mockResolvedValue(undefined);
      jest
        .spyOn(userRoleService, 'assignRoleToManyUserWorkspace')
        .mockResolvedValue(undefined);
      jest
        .spyOn(workspaceInvitationService, 'invalidateWorkspaceInvitation')
        .mockResolvedValue(undefined);

      await service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace);

      expect(service.checkUserWorkspaceExists).toHaveBeenCalledWith(
        user.id,
        workspace.id,
      );
      expect(service.create).toHaveBeenCalled();
      expect(service.create).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        userId: user.id,
        isExistingUser: true,
      });
      expect(service.createWorkspaceMember).toHaveBeenCalledWith(
        workspace.id,
        user,
      );
      expect(
        userRoleService.assignRoleToManyUserWorkspace,
      ).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        userWorkspaceIds: [userWorkspace.id],
        roleId: workspace.defaultRoleId,
      });
      expect(
        workspaceInvitationService.invalidateWorkspaceInvitation,
      ).toHaveBeenCalledWith(workspace.id, user.email);

      expect(
        onboardingService.setOnboardingCreateProfilePending,
      ).toHaveBeenCalledWith({
        userId: user.id,
        workspaceId: workspace.id,
        value: true,
      });
    });

    it('should not add user to workspace if already in workspace', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
      } as UserEntity;
      const workspace = {
        id: 'workspace-id',
        defaultRoleId: 'default-role-id',
      } as WorkspaceEntity;
      const userWorkspace = {
        id: 'user-workspace-id',
        userId: user.id,
        workspaceId: workspace.id,
      } as UserWorkspaceEntity;

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
      } as UserEntity;
      const workspace = {
        id: 'workspace-id',
        defaultRoleId: undefined,
      } as unknown as WorkspaceEntity;

      jest.spyOn(service, 'checkUserWorkspaceExists').mockResolvedValue(null);
      jest
        .spyOn(service, 'create')
        .mockResolvedValue({} as UserWorkspaceEntity);
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
      const userWorkspace = {
        userId,
        workspaceId,
      } as unknown as UserWorkspaceEntity;

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
      } as unknown as WorkspaceEntity;
      const workspace2 = {
        id: 'workspace-id-2',
        displayName: 'Workspace 2',
        logo: 'logo2.png',
        workspaceSSOIdentityProviders: [],
      } as unknown as WorkspaceEntity;
      const user = {
        email,
        userWorkspaces: [
          {
            workspaceId: workspace1.id,
            workspace: workspace1,
          },
          {
            workspaceId: workspace2.id,
            workspace: workspace2,
          },
        ],
      } as UserEntity;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(
          approvedAccessDomainService,
          'findValidatedApprovedAccessDomainWithWorkspacesAndSSOIdentityProvidersDomain',
        )
        .mockResolvedValue([]);

      jest
        .spyOn(workspaceInvitationService, 'findInvitationsByEmail')
        .mockResolvedValue([]);

      const result = await service.findAvailableWorkspacesByEmail(email);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email,
        },
        relations: {
          userWorkspaces: {
            workspace: {
              workspaceSSOIdentityProviders: true,
              approvedAccessDomains: true,
            },
          },
        },
      });

      expect(result).toEqual({
        availableWorkspacesForSignIn: [
          { workspace: workspace1 },
          { workspace: workspace2 },
        ],
        availableWorkspacesForSignUp: [],
      });
    });

    it('should find available workspaces including approved domain workspace for an email', async () => {
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
      } as unknown as WorkspaceEntity;
      const workspace2 = {
        id: 'workspace-id-2',
        displayName: 'Workspace 2',
        logo: 'logo2.png',
        workspaceSSOIdentityProviders: [],
      } as unknown as WorkspaceEntity;

      const user = {
        email,
        userWorkspaces: [
          {
            workspaceId: workspace1.id,
            workspace: workspace1,
          },
        ],
      } as UserEntity;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(
          approvedAccessDomainService,
          'findValidatedApprovedAccessDomainWithWorkspacesAndSSOIdentityProvidersDomain',
        )
        .mockResolvedValueOnce([
          {
            id: 'domain-id-2',
            workspaceId: workspace2.id,
            workspace: workspace2,
            isValidated: true,
          } as unknown as ApprovedAccessDomainEntity,
        ]);

      jest
        .spyOn(workspaceInvitationService, 'findInvitationsByEmail')
        .mockResolvedValue([]);

      const result = await service.findAvailableWorkspacesByEmail(email);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email,
        },
        relations: {
          userWorkspaces: {
            workspace: {
              workspaceSSOIdentityProviders: true,
              approvedAccessDomains: true,
            },
          },
        },
      });

      expect(result).toEqual({
        availableWorkspacesForSignIn: [{ workspace: workspace1 }],
        availableWorkspacesForSignUp: [{ workspace: workspace2 }],
      });
    });

    it('should return workspace with approved access domain if user is not found', async () => {
      const email = 'nonexistent@example.com';
      const workspace1 = {
        id: 'workspace-id-1',
        displayName: 'Workspace 1',
        logo: 'logo1.png',
        workspaceSSOIdentityProviders: [],
      } as unknown as WorkspaceEntity;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      jest
        .spyOn(
          approvedAccessDomainService,
          'findValidatedApprovedAccessDomainWithWorkspacesAndSSOIdentityProvidersDomain',
        )
        .mockResolvedValueOnce([
          {
            id: 'domain-id-1',
            workspaceId: workspace1.id,
            workspace: workspace1,
            isValidated: true,
          } as unknown as ApprovedAccessDomainEntity,
        ]);

      jest
        .spyOn(workspaceInvitationService, 'findInvitationsByEmail')
        .mockResolvedValue([]);

      const result = await service.findAvailableWorkspacesByEmail(email);

      expect(result).toEqual({
        availableWorkspacesForSignIn: [],
        availableWorkspacesForSignUp: [{ workspace: workspace1 }],
      });
    });
  });

  describe('findFirstWorkspaceByUserId', () => {
    it('should find the first workspace for a user', async () => {
      const userId = 'user-id';
      const workspace1 = {
        id: 'workspace-id',
        createdAt: '2025-01-02T00:00:00.000Z',
      } as unknown as WorkspaceEntity;
      const workspace2 = {
        id: 'workspace-id-2',
        createdAt: '2025-01-01T00:00:00.000Z',
      } as unknown as WorkspaceEntity;
      const user = {
        id: userId,
        userWorkspaces: [{ workspace: workspace1 }, { workspace: workspace2 }],
      } as unknown as UserEntity;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findFirstWorkspaceByUserId(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
        relations: { userWorkspaces: { workspace: true } },
        order: {
          userWorkspaces: {
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
      } as unknown as UserEntity;

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
      const userWorkspace = {
        userId,
        workspaceId,
      } as unknown as UserWorkspaceEntity;

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
        relations: ['twoFactorAuthenticationMethods'],
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
      } as WorkspaceEntity;
      const workspaceMemberRepository = {
        findOne: jest.fn().mockResolvedValue(workspaceMember),
      };

      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(workspaceMemberRepository as any);

      const result = await service.getWorkspaceMemberOrThrow({
        workspaceMemberId,
        workspaceId,
      });

      expect(globalWorkspaceOrmManager.getRepository).toHaveBeenCalledWith(
        workspaceId,
        'workspaceMember',
        {
          shouldBypassPermissionChecks: true,
        },
      );
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
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(workspaceMemberRepository as any);

      await expect(
        service.getWorkspaceMemberOrThrow({ workspaceMemberId, workspaceId }),
      ).rejects.toThrow('Workspace member not found');
    });
  });
});
