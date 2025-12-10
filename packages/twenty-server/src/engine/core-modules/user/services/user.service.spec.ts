import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository, type UpdateResult } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;
  let workspaceService: WorkspaceService;
  let globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  let userRoleService: UserRoleService;

  const mockWorkspaceMemberRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  } as unknown as WorkspaceRepository<WorkspaceMemberWorkspaceEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: WorkspaceService,
          useValue: { deleteWorkspace: jest.fn() },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain:
              jest.fn(),
          },
        },
        {
          provide: EmailVerificationService,
          useValue: { sendVerificationEmail: jest.fn() },
        },
        {
          provide: `MESSAGE_QUEUE_${MessageQueue.workspaceQueue}`,
          useValue: { add: jest.fn() },
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
        {
          provide: UserRoleService,
          useValue: {
            validateUserWorkspaceIsNotUniqueAdminOrThrow: jest.fn(),
          },
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            deleteUserWorkspace: jest.fn(),
          },
        },
        {
          provide: ApplicationService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    userRoleService = module.get<UserRoleService>(UserRoleService);
    globalWorkspaceOrmManager = module.get<GlobalWorkspaceOrmManager>(
      GlobalWorkspaceOrmManager,
    );
    workspaceService = module.get<WorkspaceService>(WorkspaceService);
  });

  describe('loadWorkspaceMember', () => {
    it('returns null when workspace is not active/suspended', async () => {
      // isWorkspaceActiveOrSuspendedSpy.mockReturnValue(false);

      const res = await service.loadWorkspaceMember(
        { id: 'u1' } as UserEntity,
        { id: 'w1' } as WorkspaceEntity,
      );

      expect(res).toBeNull();
      expect(globalWorkspaceOrmManager.getRepository).not.toHaveBeenCalled();
    });

    it('fetches from workspace member repo when workspace active', async () => {
      jest.spyOn(mockWorkspaceMemberRepo, 'findOne').mockResolvedValue({
        id: 'wm1',
        userId: 'u1',
      } as WorkspaceMemberWorkspaceEntity);

      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(mockWorkspaceMemberRepo);

      const res = await service.loadWorkspaceMember(
        { id: 'u1' } as UserEntity,
        {
          id: 'w1',
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        } as WorkspaceEntity,
      );

      expect(globalWorkspaceOrmManager.getRepository).toHaveBeenCalledWith(
        'w1',
        'workspaceMember',
        {
          shouldBypassPermissionChecks: true,
        },
      );
      expect(mockWorkspaceMemberRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(res).toEqual({ id: 'wm1', userId: 'u1' });
    });
  });

  describe('loadWorkspaceMembers', () => {
    it('returns [] when workspace is not active/suspended', async () => {
      const res = await service.loadWorkspaceMembers({
        id: 'w1',
        activationStatus: WorkspaceActivationStatus.INACTIVE,
      } as WorkspaceEntity);

      expect(res).toEqual([]);
      expect(globalWorkspaceOrmManager.getRepository).not.toHaveBeenCalled();
    });

    it('fetches members withDeleted flag', async () => {
      jest
        .spyOn(mockWorkspaceMemberRepo, 'find')
        .mockResolvedValue([{ id: 'wm1' } as WorkspaceMemberWorkspaceEntity]);
      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(mockWorkspaceMemberRepo);

      const res = await service.loadWorkspaceMembers(
        {
          id: 'w2',
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        } as WorkspaceEntity,
        true,
      );

      expect(mockWorkspaceMemberRepo.find).toHaveBeenCalledWith({
        withDeleted: true,
      });
      expect(res).toEqual([{ id: 'wm1' }]);
    });
  });

  describe('loadDeletedWorkspaceMembersOnly', () => {
    it('returns [] when workspace is not active/suspended', async () => {
      const res = await service.loadDeletedWorkspaceMembersOnly({
        id: 'w1',
        activationStatus: WorkspaceActivationStatus.INACTIVE,
      } as WorkspaceEntity);

      expect(res).toEqual([]);
    });

    it('fetches only deleted members with withDeleted:true', async () => {
      jest
        .spyOn(mockWorkspaceMemberRepo, 'find')
        .mockResolvedValue([
          { id: 'wm-del' } as WorkspaceMemberWorkspaceEntity,
        ]);
      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(mockWorkspaceMemberRepo);

      await service.loadDeletedWorkspaceMembersOnly({
        id: 'w3',
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      } as WorkspaceEntity);

      expect(mockWorkspaceMemberRepo.find).toHaveBeenCalledWith({
        where: { deletedAt: expect.any(Object) },
        withDeleted: true,
      });
    });
  });

  describe('findUserByEmailOrThrow', () => {
    it('returns user when found', async () => {
      const user = { id: 'u1', email: 'a@b.com' } as UserEntity;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      await expect(service.findUserByEmailOrThrow('a@b.com')).resolves.toEqual(
        user,
      );
    });

    it('throws when not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.findUserByEmailOrThrow('none@b.com'),
      ).rejects.toBeTruthy();
    });
  });

  describe('findUserByEmail', () => {
    it('returns the user when found', async () => {
      const user: Partial<UserEntity> = { id: 'u1', email: 'john@doe.com' };

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findUserByEmail('john@doe.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@doe.com' },
      });
      expect(result).toEqual(user);
    });

    it('returns null when not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.findUserByEmail('missing@doe.com');

      expect(result).toBeNull();
    });
  });

  describe('hasUserAccessToWorkspaceOrThrow', () => {
    it('resolves when user has access', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 'u1' });
      await expect(
        service.hasUserAccessToWorkspaceOrThrow('u1', 'w1'),
      ).resolves.toBeUndefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u1', userWorkspaces: { workspaceId: 'w1' } },
        relations: { userWorkspaces: true },
      });
    });

    it('throws AuthException when user has no access', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.hasUserAccessToWorkspaceOrThrow('u2', 'w2'),
      ).rejects.toBeInstanceOf(AuthException);
    });
  });

  describe('markEmailAsVerified', () => {
    it('sets isEmailVerified and saves', async () => {
      const user = { id: 'u1', isEmailVerified: false } as UserEntity;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userRepository.save as jest.Mock).mockImplementation(
        async (u: UserEntity) => u,
      );

      const res = await service.markEmailAsVerified('u1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u1' },
      });
      expect(res.isEmailVerified).toBe(true);
      expect(userRepository.save).toHaveBeenCalledWith({
        id: 'u1',
        isEmailVerified: true,
      });
    });

    it('throws when user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.markEmailAsVerified('nope')).rejects.toBeTruthy();
    });
  });

  describe('deleteUser', () => {
    const wmForUser = (userId: string) =>
      ({ id: 'wm-1', userId }) as WorkspaceMemberWorkspaceEntity;

    it('throws mapped PermissionsException when cannot unassign last admin', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'u1',
        userWorkspaces: [{ id: 'uw1', workspaceId: 'w1' }],
      });

      jest
        .spyOn(mockWorkspaceMemberRepo, 'find')
        .mockResolvedValue([
          wmForUser('u1'),
          { id: 'wm-2', userId: 'uX' } as WorkspaceMemberWorkspaceEntity,
        ]);
      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(mockWorkspaceMemberRepo);

      jest
        .spyOn(userRoleService, 'validateUserWorkspaceIsNotUniqueAdminOrThrow')
        .mockRejectedValue(
          new PermissionsException(
            'x',
            PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN,
          ),
        );

      await expect(service.deleteUser('u1')).rejects.toBeInstanceOf(
        PermissionsException,
      );
      await expect(service.deleteUser('u1')).rejects.toMatchObject({
        code: PermissionsExceptionCode.CANNOT_DELETE_LAST_ADMIN_USER,
      });
    });

    it('deletes workspace member and workspace when user is sole member', async () => {
      const mockedUserWorkspace = {
        id: 'uw2',
        workspaceId: 'w2',
      } as UserWorkspaceEntity;

      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'u2',
        userWorkspaces: [mockedUserWorkspace],
      });

      jest
        .spyOn(mockWorkspaceMemberRepo, 'find')
        .mockResolvedValue([wmForUser('u2')]);
      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(mockWorkspaceMemberRepo);

      (userRepository.softDelete as jest.Mock).mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      } as UpdateResult);

      const res = await service.deleteUser('u2');

      expect(workspaceService.deleteWorkspace).toHaveBeenCalledWith('w2');
      expect(res).toMatchObject({ id: 'u2' });
    });

    it('throws when user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteUser('missing')).rejects.toBeTruthy();
    });
  });

  describe('findUserById', () => {
    it('returns the user when found', async () => {
      const user = { id: 'u42' } as UserEntity;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findUserById('u42');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u42' },
      });
      expect(result).toEqual(user);
    });

    it('returns null when not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findUserById('missing');

      expect(result).toBeNull();
    });
  });

  describe('findUserByIdOrThrow', () => {
    it('returns user when found', async () => {
      const user = { id: 'u99' } as UserEntity;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      await expect(service.findUserByIdOrThrow('u99')).resolves.toEqual(user);
    });

    it('throws provided error when not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      const error = new Error('not found');

      await expect(service.findUserByIdOrThrow('nope', error)).rejects.toThrow(
        error,
      );
    });
  });
});
