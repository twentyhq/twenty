import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { BillingSeatService } from 'src/engine/core-modules/billing/services/billing-seat.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleAssignmentWriteService } from 'src/engine/permissions/role-assignment/role-assignment-write.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const USER_ID = '20202020-0000-4000-8000-000000000002';
const USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000003';
const DEFAULT_ROLE_ID = '20202020-0000-4000-8000-000000000004';
const INVITED_ROLE_ID = '20202020-0000-4000-8000-000000000005';

const user = Object.assign(new UserEntity(), {
  id: USER_ID,
  email: 'tim@apple.dev',
  locale: 'en',
});

const workspace = Object.assign(new WorkspaceEntity(), {
  id: WORKSPACE_ID,
  defaultRoleId: DEFAULT_ROLE_ID,
  activationStatus: WorkspaceActivationStatus.ACTIVE,
});

const userWorkspace = Object.assign(new UserWorkspaceEntity(), {
  id: USER_WORKSPACE_ID,
  userId: USER_ID,
  workspaceId: WORKSPACE_ID,
});

const buildService = async ({
  existingUserWorkspace,
  hasRole,
  pendingInvitationRoleId,
}: {
  existingUserWorkspace: UserWorkspaceEntity | null;
  hasRole: boolean;
  pendingInvitationRoleId?: string;
}) => {
  const pendingInvitation =
    pendingInvitationRoleId === undefined
      ? null
      : Object.assign(new AppTokenEntity(), {
          id: '20202020-0000-4000-8000-000000000006',
          type: AppTokenType.InvitationToken,
          context: { email: user.email, roleId: pendingInvitationRoleId },
        });

  const assignRoleToUserWorkspaces = jest.fn();
  const addMemberWithinSeatLimit = jest.fn(
    async ({ addMember }: { addMember: () => Promise<UserWorkspaceEntity> }) =>
      addMember(),
  );
  const setOnboardingCreateProfilePending = jest.fn();

  const module = await Test.createTestingModule({
    providers: [
      UserWorkspaceService,
      {
        provide: getRepositoryToken(UserWorkspaceEntity),
        useValue: { findOneBy: async () => existingUserWorkspace },
      },
      {
        provide: getWorkspaceScopedRepositoryToken(RoleTargetEntity),
        useValue: { existsBy: async () => hasRole },
      },
      {
        provide: WorkspaceInvitationService,
        useValue: {
          getOneWorkspaceInvitation: async () => pendingInvitation,
          invalidateWorkspaceInvitation: jest.fn(),
        },
      },
      {
        provide: RoleAssignmentWriteService,
        useValue: {
          assertRoleAssignableToUsersOrThrow: jest.fn(),
          assignRoleToUserWorkspaces,
        },
      },
      {
        provide: OnboardingService,
        useValue: { setOnboardingCreateProfilePending },
      },
      {
        provide: WorkspaceCacheService,
        useValue: { invalidateAndRecompute: jest.fn() },
      },
      {
        provide: BillingSeatService,
        useValue: { addMemberWithinSeatLimit },
      },
    ],
  })
    .useMocker(() => ({}))
    .compile();

  const service = module.get(UserWorkspaceService);

  const create = jest.spyOn(service, 'create').mockResolvedValue(userWorkspace);
  const createWorkspaceMember = jest
    .spyOn(service, 'createWorkspaceMember')
    .mockResolvedValue();

  return {
    service,
    assignRoleToUserWorkspaces,
    addMemberWithinSeatLimit,
    setOnboardingCreateProfilePending,
    create,
    createWorkspaceMember,
  };
};

describe('UserWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace', () => {
  it('should leave a member that already has a role untouched', async () => {
    const { service, assignRoleToUserWorkspaces, createWorkspaceMember } =
      await buildService({
        existingUserWorkspace: userWorkspace,
        hasRole: true,
      });

    await service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace);

    expect(createWorkspaceMember).not.toHaveBeenCalled();
    expect(assignRoleToUserWorkspaces).not.toHaveBeenCalled();
  });

  it('should finish the setup of a member left without a role', async () => {
    const {
      service,
      assignRoleToUserWorkspaces,
      addMemberWithinSeatLimit,
      setOnboardingCreateProfilePending,
      create,
      createWorkspaceMember,
    } = await buildService({
      existingUserWorkspace: userWorkspace,
      hasRole: false,
    });

    await service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace);

    expect(create).not.toHaveBeenCalled();
    expect(addMemberWithinSeatLimit).not.toHaveBeenCalled();
    expect(createWorkspaceMember).toHaveBeenCalledWith(WORKSPACE_ID, user);
    expect(assignRoleToUserWorkspaces).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceIds: [USER_WORKSPACE_ID],
      roleId: DEFAULT_ROLE_ID,
    });
    expect(setOnboardingCreateProfilePending).toHaveBeenCalled();
  });

  it('should leave the creator of a workspace pending creation untouched', async () => {
    const { service, assignRoleToUserWorkspaces, createWorkspaceMember } =
      await buildService({
        existingUserWorkspace: userWorkspace,
        hasRole: false,
      });

    await service.addUserToWorkspaceIfUserNotInWorkspace(
      user,
      Object.assign(new WorkspaceEntity(), workspace, {
        activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      }),
    );

    expect(createWorkspaceMember).not.toHaveBeenCalled();
    expect(assignRoleToUserWorkspaces).not.toHaveBeenCalled();
  });

  it('should give a member left without a role the role of their pending invitation', async () => {
    const { service, assignRoleToUserWorkspaces } = await buildService({
      existingUserWorkspace: userWorkspace,
      hasRole: false,
      pendingInvitationRoleId: INVITED_ROLE_ID,
    });

    await service.addUserToWorkspaceIfUserNotInWorkspace(user, workspace);

    expect(assignRoleToUserWorkspaces).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceIds: [USER_WORKSPACE_ID],
      roleId: INVITED_ROLE_ID,
    });
  });

  it('should add a new member within the seat limit and assign the role', async () => {
    const {
      service,
      assignRoleToUserWorkspaces,
      addMemberWithinSeatLimit,
      create,
      createWorkspaceMember,
    } = await buildService({ existingUserWorkspace: null, hasRole: false });

    await service.addUserToWorkspaceIfUserNotInWorkspace(
      user,
      workspace,
      INVITED_ROLE_ID,
    );

    expect(addMemberWithinSeatLimit).toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
    expect(createWorkspaceMember).toHaveBeenCalledWith(WORKSPACE_ID, user);
    expect(assignRoleToUserWorkspaces).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceIds: [USER_WORKSPACE_ID],
      roleId: INVITED_ROLE_ID,
    });
  });
});
