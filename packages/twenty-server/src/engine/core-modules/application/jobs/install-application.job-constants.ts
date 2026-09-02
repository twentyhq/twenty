export const INSTALL_APPLICATION_JOB_NAME = 'InstallApplicationJob';

export type InstallApplicationJobData = {
  applicationId: string;
  appRegistrationId: string;
  universalIdentifier: string;
  version?: string;
  workspaceId: string;
};
