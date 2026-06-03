export type ShahryarAdminPasswordResetRequest = {
  workspaceMemberId: string;
  newPassword: string;
};

export type ShahryarAdminPasswordResetResponse = {
  success: boolean;
  workspaceMemberId: string;
  resetAt: string;
};

export type ShahryarAdminCreateSupervisorRequest = {
  workspaceMemberId: string;
  username?: string;
};

export type ShahryarAdminUpdateUsernameRequest = {
  workspaceMemberId: string;
  username: string;
};

export type ShahryarAdminRemoveSupervisorRequest = {
  workspaceMemberId: string;
};

export type ShahryarAdminSupervisorOperationResponse = {
  success: boolean;
  workspaceMemberId: string;
  username: string;
  isShahryarSupervisor: boolean;
};

export type ShahryarAdminWorkspaceMember = {
  id: string;
  name: string;
  username: string;
  userEmail: string;
  isShahryarSupervisor: boolean;
};
