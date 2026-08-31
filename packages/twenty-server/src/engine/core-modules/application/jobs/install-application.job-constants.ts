export const INSTALL_APPLICATION_JOB_NAME = 'InstallApplicationJob';

export type InstallApplicationJobData = {
  appRegistrationId: string;
  version?: string;
  workspaceId: string;
  initiatorUserWorkspaceId?: string;
};
