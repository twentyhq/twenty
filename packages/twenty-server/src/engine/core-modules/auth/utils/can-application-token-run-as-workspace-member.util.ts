// A delegated token carries no workspaceMemberId while the workspace is being
// created, so only the absence of a user makes a token application-only.
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
