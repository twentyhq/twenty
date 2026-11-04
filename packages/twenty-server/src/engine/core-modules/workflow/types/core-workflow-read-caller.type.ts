import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

// Callers that never act for an installed application leave this out and read every workflow
export type CoreWorkflowReadCaller = {
  callerApplication?: FlatApplication;
  workspaceCustomApplicationId?: string;
};
