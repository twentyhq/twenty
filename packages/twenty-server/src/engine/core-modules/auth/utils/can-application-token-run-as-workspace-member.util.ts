// An application token already delegated to a member must not be able to trade
// itself for one acting as somebody else, or a single compromised delegation
// would reach every member in the workspace. A missing member id does not make
// a token application-only: JwtAuthStrategy resolves workspaceMemberId after
// the activation-status early return, so a delegated token carries none while
// the workspace is being created. Only the absence of a user makes a token
// application-only; a delegated one with no resolved member fails closed.
export const canApplicationTokenRunAsWorkspaceMember = ({
  isDelegatedToUser,
  requestWorkspaceMemberId,
  workspaceMemberId,
}: {
  isDelegatedToUser: boolean;
  requestWorkspaceMemberId: string | null;
  workspaceMemberId: string;
}): boolean =>
  !isDelegatedToUser || requestWorkspaceMemberId === workspaceMemberId;
