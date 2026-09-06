import { isDefined } from 'twenty-shared/utils';

// An application token already delegated to a member must not be able to trade
// itself for one acting as somebody else, or a single compromised delegation
// would reach every member in the workspace.
export const canApplicationTokenRunAsWorkspaceMember = ({
  requestWorkspaceMemberId,
  workspaceMemberId,
}: {
  requestWorkspaceMemberId: string | null;
  workspaceMemberId: string;
}): boolean =>
  !isDefined(requestWorkspaceMemberId) ||
  requestWorkspaceMemberId === workspaceMemberId;
