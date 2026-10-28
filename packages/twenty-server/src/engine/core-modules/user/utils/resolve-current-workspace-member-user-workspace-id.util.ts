import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

export const resolveCurrentWorkspaceMemberUserWorkspaceId = ({
  workspaceMemberId,
  flatWorkspaceMemberMaps,
}: {
  workspaceMemberId: string;
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
}): string | undefined => {
  const workspaceMember = flatWorkspaceMemberMaps.byId[workspaceMemberId];

  if (!isDefined(workspaceMember) || isDefined(workspaceMember.deletedAt)) {
    return undefined;
  }

  if (
    flatWorkspaceMemberMaps.idByUserId[workspaceMember.userId] !==
    workspaceMemberId
  ) {
    return undefined;
  }

  return flatWorkspaceMemberMaps.userWorkspaceIdByUserId[
    workspaceMember.userId
  ];
};
