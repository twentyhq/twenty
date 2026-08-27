export const UPGRADE_APPLICATION_JOB_NAME = 'UpgradeApplicationJob';

export type UpgradeApplicationJobData = {
  appRegistrationId: string;
  targetVersion: string;
  workspaceId: string;
};
