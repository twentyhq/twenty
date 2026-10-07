import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';

export const resolveWorkspaceMemberIdForUser = ({
  userId,
  flatWorkspaceMemberMaps,
}: {
  userId: string;
  flatWorkspaceMemberMaps: {
    byId: Partial<Record<string, Pick<FlatWorkspaceMember, 'deletedAt'>>>;
    idByUserId: FlatWorkspaceMemberMaps['idByUserId'];
  };
}): string | null => {
  const workspaceMemberId = flatWorkspaceMemberMaps.idByUserId[userId];

  if (!isDefined(workspaceMemberId)) {
    return null;
  }

  const workspaceMember = flatWorkspaceMemberMaps.byId[workspaceMemberId];

  return isDefined(workspaceMember?.deletedAt) ? null : workspaceMemberId;
};
