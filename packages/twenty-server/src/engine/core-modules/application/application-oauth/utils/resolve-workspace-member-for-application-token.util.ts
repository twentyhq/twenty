import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

// Mirrors the agent run-as rules: a token already bound to a person may only
// re-issue itself for that person, and only a live member can be acted as.
export const resolveWorkspaceMemberForApplicationToken = ({
  workspaceMemberId,
  requestUserWorkspaceId,
  requestWorkspaceMemberId,
  flatWorkspaceMemberMaps,
}: {
  workspaceMemberId: string;
  requestUserWorkspaceId: string | null;
  requestWorkspaceMemberId: string | null;
  flatWorkspaceMemberMaps: Pick<FlatWorkspaceMemberMaps, 'byId'>;
}): FlatWorkspaceMember => {
  if (
    isDefined(requestUserWorkspaceId) &&
    requestWorkspaceMemberId !== workspaceMemberId
  ) {
    throw new ApplicationException(
      'An application token issued for a user can only act as that user',
      ApplicationExceptionCode.FORBIDDEN,
    );
  }

  const workspaceMember = flatWorkspaceMemberMaps.byId[workspaceMemberId];

  if (!isDefined(workspaceMember) || isDefined(workspaceMember.deletedAt)) {
    throw new ApplicationException(
      `Workspace member ${workspaceMemberId} not found`,
      ApplicationExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
    );
  }

  return workspaceMember;
};
