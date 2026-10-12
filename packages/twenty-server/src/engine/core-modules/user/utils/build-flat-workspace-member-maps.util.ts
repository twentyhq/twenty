import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

// A user who left and rejoined keeps a soft-deleted member next to the live one
export const buildFlatWorkspaceMemberMaps = ({
  workspaceMembers,
  userWorkspaces,
}: {
  workspaceMembers: FlatWorkspaceMember[];
  userWorkspaces: Pick<UserWorkspaceEntity, 'id' | 'userId'>[];
}): FlatWorkspaceMemberMaps => {
  const flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps = {
    byId: {},
    idByUserId: {},
    idByUserWorkspaceId: {},
    userWorkspaceIdByUserId: {},
  };

  for (const workspaceMember of workspaceMembers) {
    const existingWorkspaceMemberId =
      flatWorkspaceMemberMaps.idByUserId[workspaceMember.userId];
    const existingWorkspaceMember = isDefined(existingWorkspaceMemberId)
      ? flatWorkspaceMemberMaps.byId[existingWorkspaceMemberId]
      : undefined;

    flatWorkspaceMemberMaps.byId[workspaceMember.id] = workspaceMember;

    if (
      !isDefined(existingWorkspaceMember) ||
      isDefined(existingWorkspaceMember.deletedAt)
    ) {
      flatWorkspaceMemberMaps.idByUserId[workspaceMember.userId] =
        workspaceMember.id;
    }
  }

  for (const userWorkspace of userWorkspaces) {
    const workspaceMemberId =
      flatWorkspaceMemberMaps.idByUserId[userWorkspace.userId];
    const workspaceMember = isDefined(workspaceMemberId)
      ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
      : undefined;

    flatWorkspaceMemberMaps.userWorkspaceIdByUserId[userWorkspace.userId] =
      userWorkspace.id;

    if (isDefined(workspaceMember) && !isDefined(workspaceMember.deletedAt)) {
      flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspace.id] =
        workspaceMember.id;
    }
  }

  return flatWorkspaceMemberMaps;
};
