export type ShahryarAdminPasswordResetRequest = {
  workspaceMemberId: string;
  newPassword: string;
};

export type ShahryarAdminPasswordResetResponse = {
  success: boolean;
  workspaceMemberId: string;
  resetAt: string;
};

export type ShahryarAdminWorkspaceMember = {
  id: string;
  name: string;
  username: string;
  userEmail: string;
};
