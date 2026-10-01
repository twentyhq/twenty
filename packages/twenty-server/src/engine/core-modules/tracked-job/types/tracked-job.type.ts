import { type PermissionFlagType } from 'twenty-shared/constants';

export type TrackedJob = {
  id: string;
  jobName: string;
  workspaceId: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  permissionFlag?: PermissionFlagType;
  permissionsHash: string;
  expiresAt: number;
};
