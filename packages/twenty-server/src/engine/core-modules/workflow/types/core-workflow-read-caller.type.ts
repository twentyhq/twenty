import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

// Required so a caller states it acts for no application instead of forgetting it and reading every workflow
export type CoreWorkflowReadCaller = {
  callerApplication: FlatApplication | undefined;
  workspaceCustomApplicationId?: string;
};
