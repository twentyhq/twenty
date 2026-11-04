import { type ApplicationLogSource } from 'twenty-shared/types';

export type ApplicationLogEntry = {
  timestamp: Date;
  workspaceId: string;
  applicationId: string;
  applicationRegistrationId: string;
  applicationVersion: string;
  source: ApplicationLogSource;
  logicFunctionId: string;
  logicFunctionName: string;
  executionId: string;
  level: string;
  message: string;
  errorCode?: string;
  properties?: Record<string, unknown>;
};
