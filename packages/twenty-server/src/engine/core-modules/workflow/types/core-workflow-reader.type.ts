import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';

export type CoreWorkflowReader = CoreWorkflowReadCaller & {
  userWorkspaceId: string | undefined;
};
