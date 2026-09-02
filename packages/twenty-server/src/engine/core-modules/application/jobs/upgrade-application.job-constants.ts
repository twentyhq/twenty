export const UPGRADE_APPLICATION_JOB_NAME = 'UpgradeApplicationJob';

export type UpgradeApplicationJobData = {
  applicationId: string;
  appRegistrationId: string;
  universalIdentifier: string;
  targetVersion: string;
  workspaceId: string;
};
