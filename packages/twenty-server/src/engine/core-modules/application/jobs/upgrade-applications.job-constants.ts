export const UPGRADE_APPLICATIONS_JOB_NAME = 'UpgradeApplicationsJob';

export type UpgradeApplicationsJobData = {
  applicationRegistrationId: string;
  onlyAutoUpgrade: boolean;
  batchSize?: number;
};
