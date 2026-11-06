import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleAssignmentService } from 'src/engine/permissions/role-assignment/role-assignment.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const USER_ID = '20202020-2222-4222-8222-222222222222';
const USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';
const ROLE_ID = '20202020-4444-4444-8444-444444444444';

type FakeUserWorkspace = { id: string; userId: string; workspaceId: string };
type FakeRoleTarget = { userWorkspaceId: string; roleId: string };
type FakeWorkspaceMember = { userId: string; userEmail: string };

type CoreTables = {
  userWorkspaces: FakeUserWorkspace[];
  roleTargets: FakeRoleTarget[];
};

const user = {
  id: USER_ID,
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  locale: 'en',
} as UserEntity;

const workspace = {
  id: WORKSPACE_ID,
  defaultRoleId: ROLE_ID,
} as WorkspaceEntity;

describe('UserWorkspaceService', () => {
  let service: UserWorkspaceService;
  let core: CoreTables;
  let workspaceMembers: FakeWorkspaceMember[];
  let workspaceMemberInsertError: Error | undefined;
  let coreDeleteError: Error | undefined;
  let roleAssignmentError: Error | undefined;

  const buildWorkspaceMemberRepository = (members: FakeWorkspaceMember[]) => ({
    find: async ({ where }: { where: { userId: string } }) =>
      members.filter((member) => member.userId === where.userId),
    insert: async (member: FakeWorkspaceMember) => {
      if (isErrorSet(workspaceMemberInsertError)) {
        throw workspaceMemberInsertError;
      }
      members.push({ userId: member.userId, userEmail: member.userEmail });
    },
    delete: async ({ userId }: { userId: string }) => {
      members.splice(
        0,
        members.length,
        ...members.filter((member) => member.userId !== userId),
      );
    },
  });

  // Commits only when the work resolves, like a real transaction
  const runInFakeTransaction = async <TTables, TResult>(
    committed: TTables,
    clone: (tables: TTables) => TTables,
    work: (draft: TTables) => Promise<TResult>,
    commit: (draft: TTables) => void,
  ): Promise<TResult> => {
    const draft = clone(committed);
    const result = await work(draft);

    commit(draft);

    return result;
  };

  const cloneCore = (tables: CoreTables): CoreTables => ({
    userWorkspaces: [...tables.userWorkspaces],
    roleTargets: [...tables.roleTargets],
  });

  beforeEach(async () => {
    core = { userWorkspaces: [], roleTargets: [] };
    workspaceMembers = [];
    workspaceMemberInsertError = undefined;
    coreDeleteError = undefined;
    roleAssignmentError = undefined;

    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const userWorkspaceRepository = {
      findOne: async () => null,
      findOneBy: async ({ userId, workspaceId }: FakeUserWorkspace) =>
        core.userWorkspaces.find(
          (userWorkspace) =>
            userWorkspace.userId === userId &&
            userWorkspace.workspaceId === workspaceId,
        ) ?? null,
      findOneOrFail: async ({
        where,
      }: {
        where: { userId: string; workspaceId: string };
      }) => {
        const userWorkspace = core.userWorkspaces.find(
          (candidate) =>
            candidate.userId === where.userId &&
            candidate.workspaceId === where.workspaceId,
        );

        if (!userWorkspace) {
          throw new Error('userWorkspace not found');
        }

        return { ...userWorkspace, defaultAvatarUrl: null };
      },
      delete: async ({ id }: { id: string }) => {
        if (isErrorSet(coreDeleteError)) {
          throw coreDeleteError;
        }
        core.userWorkspaces = core.userWorkspaces.filter(
          (userWorkspace) => userWorkspace.id !== id,
        );
      },
      create: (userWorkspace: Omit<FakeUserWorkspace, 'id'>) => userWorkspace,
      save: async (userWorkspace: Omit<FakeUserWorkspace, 'id'>) => {
        const savedUserWorkspace = { ...userWorkspace, id: USER_WORKSPACE_ID };

        core.userWorkspaces.push(savedUserWorkspace);

        return savedUserWorkspace;
      },
      manager: {
        transaction: (work: (manager: CoreTables) => Promise<unknown>) =>
          runInFakeTransaction(
            core,
            cloneCore,
            (draft) =>
              work(
                Object.assign(draft, {
                  delete: async (
                    _entity: typeof UserWorkspaceEntity,
                    { id }: { id: string },
                  ) => {
                    if (isErrorSet(coreDeleteError)) {
                      throw coreDeleteError;
                    }
                    draft.userWorkspaces = draft.userWorkspaces.filter(
                      (userWorkspace) => userWorkspace.id !== id,
                    );
                  },
                }),
              ),
            ({ userWorkspaces, roleTargets }) => {
              core = { userWorkspaces, roleTargets };
            },
          ),
      },
    };

    const roleTargetRepository = {
      delete: async (
        _workspaceId: string,
        { userWorkspaceId }: { userWorkspaceId: string },
      ) => {
        core.roleTargets = core.roleTargets.filter(
          (roleTarget) => roleTarget.userWorkspaceId !== userWorkspaceId,
        );
      },
      withManager: (manager: CoreTables) => ({
        delete: async (
          _workspaceId: string,
          { userWorkspaceId }: { userWorkspaceId: string },
        ) => {
          manager.roleTargets = manager.roleTargets.filter(
            (roleTarget) => roleTarget.userWorkspaceId !== userWorkspaceId,
          );
        },
      }),
    };

    const workspaceOrmManager = {
      executeInWorkspaceContext: <TResult>(callback: () => TResult) =>
        callback(),
      getRepositoryWithoutPermissionChecks: () =>
        buildWorkspaceMemberRepository(workspaceMembers),
      runInWorkspaceTransaction: <TResult>(
        work: (transactionScope: {
          getRepositoryWithoutPermissionChecks: () => ReturnType<
            typeof buildWorkspaceMemberRepository
          >;
        }) => Promise<TResult>,
      ) =>
        runInFakeTransaction(
          workspaceMembers,
          (members) => [...members],
          (draft) =>
            work({
              getRepositoryWithoutPermissionChecks: () =>
                buildWorkspaceMemberRepository(draft),
            }),
          (draft) => {
            workspaceMembers = draft;
          },
        ),
    };

    const roleAssignmentService = {
      validateRoleAssignableToUsersOrThrow: async () => undefined,
      assignRoleToManyUserWorkspace: async ({
        userWorkspaceIds,
        roleId,
      }: {
        userWorkspaceIds: string[];
        roleId: string;
      }) => {
        if (isErrorSet(roleAssignmentError)) {
          throw roleAssignmentError;
        }
        core.roleTargets.push(
          ...userWorkspaceIds.map((userWorkspaceId) => ({
            userWorkspaceId,
            roleId,
          })),
        );
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserWorkspaceService,
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        {
          provide: getWorkspaceScopedRepositoryToken(RoleTargetEntity),
          useValue: roleTargetRepository,
        },
        {
          provide: WorkspaceInvitationService,
          useValue: { invalidateWorkspaceInvitation: jest.fn() },
        },
        { provide: WorkspaceDomainsService, useValue: {} },
        { provide: LoginTokenService, useValue: {} },
        { provide: ApprovedAccessDomainService, useValue: {} },
        { provide: WorkspaceOrmManager, useValue: workspaceOrmManager },
        { provide: RoleAssignmentService, useValue: roleAssignmentService },
        { provide: FileCorePictureService, useValue: {} },
        { provide: FileUrlService, useValue: {} },
        {
          provide: OnboardingService,
          useValue: { setOnboardingCreateProfilePending: jest.fn() },
        },
        { provide: CoreEntityCacheService, useValue: {} },
        { provide: TwentyConfigService, useValue: {} },
        {
          provide: WorkspaceCacheService,
          useValue: { invalidateAndRecompute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UserWorkspaceService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addUserToWorkspaceIfUserNotInWorkspace', () => {
    it('creates the userWorkspace, its role and the workspace member', async () => {
      await service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace);

      expect(core.userWorkspaces).toHaveLength(1);
      expect(core.roleTargets).toEqual([
        { userWorkspaceId: USER_WORKSPACE_ID, roleId: ROLE_ID },
      ]);
      expect(workspaceMembers).toEqual([
        { userId: USER_ID, userEmail: user.email },
      ]);
    });

    it('leaves no userWorkspace or role behind when the workspace member cannot be created', async () => {
      workspaceMemberInsertError = new Error(
        'duplicate key value violates unique constraint "userEmailUniqueIndex"',
      );

      await expect(
        service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace),
      ).rejects.toThrow('userEmailUniqueIndex');

      expect(core).toEqual({ userWorkspaces: [], roleTargets: [] });
      expect(workspaceMembers).toEqual([]);
    });

    it('leaves no userWorkspace or member behind when the role cannot be assigned', async () => {
      roleAssignmentError = new Error('role cannot be assigned');

      await expect(
        service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace),
      ).rejects.toThrow('role cannot be assigned');

      expect(core).toEqual({ userWorkspaces: [], roleTargets: [] });
      expect(workspaceMembers).toEqual([]);
    });

    it('reports the original error when the rollback fails too', async () => {
      workspaceMemberInsertError = new Error('member insert failed');
      coreDeleteError = new Error('userWorkspace delete failed');

      await expect(
        service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace),
      ).rejects.toThrow('member insert failed');
    });

    it('lets a user rejoin when only their workspace member is left', async () => {
      workspaceMembers = [{ userId: USER_ID, userEmail: user.email }];

      await service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace);

      expect(core.userWorkspaces).toHaveLength(1);
      expect(workspaceMembers).toHaveLength(1);
    });
  });

  describe('deleteWorkspaceMemberAndUserWorkspace', () => {
    beforeEach(() => {
      core = {
        userWorkspaces: [
          { id: USER_WORKSPACE_ID, userId: USER_ID, workspaceId: WORKSPACE_ID },
        ],
        roleTargets: [{ userWorkspaceId: USER_WORKSPACE_ID, roleId: ROLE_ID }],
      };
      workspaceMembers = [{ userId: USER_ID, userEmail: user.email }];
    });

    it('deletes the workspace member, its role and the userWorkspace', async () => {
      await service.deleteWorkspaceMemberAndUserWorkspace({
        userId: USER_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(core).toEqual({ userWorkspaces: [], roleTargets: [] });
      expect(workspaceMembers).toEqual([]);
    });

    it('keeps the workspace member when the userWorkspace cannot be deleted', async () => {
      coreDeleteError = new Error('userWorkspace delete failed');

      await expect(
        service.deleteWorkspaceMemberAndUserWorkspace({
          userId: USER_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toThrow('userWorkspace delete failed');

      expect(core.userWorkspaces).toHaveLength(1);
      expect(core.roleTargets).toHaveLength(1);
      expect(workspaceMembers).toEqual([
        { userId: USER_ID, userEmail: user.email },
      ]);
    });
  });
});

const isErrorSet = (error: Error | undefined): error is Error =>
  error !== undefined;
