import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const USER_ID = '20202020-0000-4000-8000-000000000002';
const USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000003';
const DEFAULT_ROLE_ID = '20202020-0000-4000-8000-000000000004';
const INVITED_ROLE_ID = '20202020-0000-4000-8000-000000000005';

const user = {
  id: USER_ID,
  email: 'tim@apple.dev',
  locale: 'en',
} as UserEntity;

const workspace = {
  id: WORKSPACE_ID,
  defaultRoleId: DEFAULT_ROLE_ID,
  activationStatus: WorkspaceActivationStatus.ACTIVE,
} as WorkspaceEntity;

const userWorkspace = {
  id: USER_WORKSPACE_ID,
  userId: USER_ID,
  workspaceId: WORKSPACE_ID,
} as UserWorkspaceEntity;

const buildService = ({
  existingUserWorkspace,
  hasRole,
  pendingInvitationRoleId,
}: {
  existingUserWorkspace: UserWorkspaceEntity | null;
  hasRole: boolean;
  pendingInvitationRoleId?: string;
}) => {
  const pendingInvitation = isDefined(pendingInvitationRoleId)
    ? {
        id: '20202020-0000-4000-8000-000000000006',
        type: AppTokenType.InvitationToken,
        context: { email: user.email, roleId: pendingInvitationRoleId },
      }
    : null;

  const assignRoleToUserWorkspaces = jest.fn();
  const addMemberWithinSeatLimit = jest.fn(
    async ({ addMember }: { addMember: () => Promise<unknown> }) => addMember(),
  );
  const setOnboardingCreateProfilePending = jest.fn();

  const service = new UserWorkspaceService(
    { findOneBy: async () => existingUserWorkspace } as never,
    {} as never,
    { existsBy: async () => hasRole } as never,
    {
      getOneWorkspaceInvitation: async () => pendingInvitation,
      invalidateWorkspaceInvitation: jest.fn(),
    } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {
      assertRoleAssignableToUsersOrThrow: jest.fn(),
      assignRoleToUserWorkspaces,
    } as never,
    {} as never,
    {} as never,
    { setOnboardingCreateProfilePending } as never,
    {} as never,
    {} as never,
    { invalidateAndRecompute: jest.fn() } as never,
    { addMemberWithinSeatLimit } as never,
  );

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
      buildService({ existingUserWorkspace: userWorkspace, hasRole: true });

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
    } = buildService({ existingUserWorkspace: userWorkspace, hasRole: false });

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
      buildService({ existingUserWorkspace: userWorkspace, hasRole: false });

    await service.addUserToWorkspaceIfUserNotInWorkspace(user, {
      ...workspace,
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    } as WorkspaceEntity);

    expect(createWorkspaceMember).not.toHaveBeenCalled();
    expect(assignRoleToUserWorkspaces).not.toHaveBeenCalled();
  });

  it('should give a member left without a role the role of their pending invitation', async () => {
    const { service, assignRoleToUserWorkspaces } = buildService({
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
    } = buildService({ existingUserWorkspace: null, hasRole: false });

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
