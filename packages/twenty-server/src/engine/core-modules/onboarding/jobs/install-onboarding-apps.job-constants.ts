export const INSTALL_ONBOARDING_APPS_JOB_NAME = 'InstallOnboardingAppsJob';

export type InstallOnboardingAppsJobData = {
  workspaceId: string;
  universalIdentifiers: string[];
  // Optional so jobs enqueued before this field existed still run after a deploy.
  userId?: string;
};
