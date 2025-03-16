import { createRequiredContext } from '~/utils/createRequiredContext';

type WorkflowStepContextType = {
  workflowVersionId: string;
};

export const [WorkflowStepContextProvider, useWorkflowStepContextOrThrow] =
  createRequiredContext<WorkflowStepContextType>('WorkflowStepContext');
