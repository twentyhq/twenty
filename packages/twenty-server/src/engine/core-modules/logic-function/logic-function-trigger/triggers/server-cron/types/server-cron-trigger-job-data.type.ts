import { type ServerCronCursor } from 'twenty-shared/application';

export type ServerCronTriggerJobData = {
  workspaceId: string;
  logicFunctionId: string;
  logicFunctionUniversalIdentifier: string;
  applicationRegistrationId: string;
  scheduledAtEpochMs: number;
  step: number;
  cursor?: ServerCronCursor;
  applicationRetryCount?: number;
};
