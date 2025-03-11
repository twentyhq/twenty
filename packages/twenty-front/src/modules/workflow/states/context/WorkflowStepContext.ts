import { createContext } from 'react';

type WorkflowStepContextType = {
  workflowVersionId?: string;
};

export const WorkflowStepContext = createContext<WorkflowStepContextType>({
  workflowVersionId: undefined,
});
