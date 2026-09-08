// A delegated token has no workspaceMemberId while the workspace is being created, so only a missing user makes a token application-only.
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
