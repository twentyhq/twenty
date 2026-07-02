export type ProvisionWorkspaceMemberInput = {
  workspaceId: string;
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type ProvisionWorkspaceMemberResult = {
  workspaceMemberId: string;
  userId: string;
  appUserId: string;
  workspaceId: string;
};
