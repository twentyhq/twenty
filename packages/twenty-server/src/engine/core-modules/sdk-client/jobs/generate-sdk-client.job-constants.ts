import { type SdkClientGenerationTrigger } from 'src/engine/core-modules/sdk-client/types/sdk-client-generation-trigger.type';

export const GENERATE_SDK_CLIENT_JOB_NAME = 'GenerateSdkClientJob';

export type GenerateSdkClientJobData = {
  workspaceId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
  // Optional: jobs enqueued before this field existed carry no trigger
  trigger?: SdkClientGenerationTrigger;
};
