import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

export const resolveTriggeredByWorkspaceMemberId = ({
  userId,
  flatWorkspaceMemberMaps,
}: {
  userId: string;
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
}): string | null => {
  const workspaceMemberId = flatWorkspaceMemberMaps.idByUserId[userId];

  if (!isDefined(workspaceMemberId)) {
    return null;
  }

  const workspaceMember = flatWorkspaceMemberMaps.byId[workspaceMemberId];

  return isDefined(workspaceMember?.deletedAt) ? null : workspaceMemberId;
};
