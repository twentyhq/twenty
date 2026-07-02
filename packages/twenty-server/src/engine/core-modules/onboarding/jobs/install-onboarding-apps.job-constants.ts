export const INSTALL_ONBOARDING_APPS_JOB_NAME = 'InstallOnboardingAppsJob';

export type InstallOnboardingAppsJobData = {
  workspaceId: string;
  universalIdentifiers: string[];
};
