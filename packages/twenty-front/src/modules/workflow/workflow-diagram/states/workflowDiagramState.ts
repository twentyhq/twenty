import { createState } from 'twenty-ui
import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const workflowDiagramState = createState<WorkflowDiagram | undefined>({
  key: 'workflowDiagramState',
  defaultValue: undefined,
});
