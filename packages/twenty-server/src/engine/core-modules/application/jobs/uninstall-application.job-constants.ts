export const UNINSTALL_APPLICATION_JOB_NAME = 'UninstallApplicationJob';

export type UninstallApplicationJobData = {
  applicationId: string;
  universalIdentifier: string;
  workspaceId: string;
};
