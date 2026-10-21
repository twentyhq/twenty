import { type ApplicationLogSource } from 'twenty-shared/types';

export type ApplicationMetricEvent = {
  timestamp: Date;
  applicationRegistrationId: string;
  workspaceId: string;
  applicationId: string;
  applicationVersion: string;
  source: ApplicationLogSource;
  logicFunctionId: string;
  logicFunctionName: string;
  level: string;
  errorCode: string;
  durationMs: number;
  occurrenceCount: number;
};
