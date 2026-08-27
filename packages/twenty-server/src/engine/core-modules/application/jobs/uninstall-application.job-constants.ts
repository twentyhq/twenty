export const UNINSTALL_APPLICATION_JOB_NAME = 'UninstallApplicationJob';

export type UninstallApplicationJobData = {
  applicationUniversalIdentifier: string;
  workspaceId: string;
  metricsAttributes: Record<string, string>;
};
