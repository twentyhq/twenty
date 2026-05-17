export const GENERATE_SDK_CLIENT_JOB_NAME = 'GenerateSdkClientJob';

export type GenerateSdkClientJobData = {
  workspaceId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
};
