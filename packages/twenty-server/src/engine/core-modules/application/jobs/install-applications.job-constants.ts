export const INSTALL_APPLICATIONS_JOB_NAME = 'InstallApplicationsJob';

export type InstallApplicationsJobApplication = {
  appRegistrationId: string;
  universalIdentifier: string;
  version?: string;
};

export type InstallApplicationsJobData = {
  applications: InstallApplicationsJobApplication[];
  isStateAlreadyTransitioned?: boolean;
  workspaceId: string;
};
