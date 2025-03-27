import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { createState } from 'twenty-ui';

export const workflowDiagramState = createState<WorkflowDiagram | undefined>({
  key: 'workflowDiagramState',
  defaultValue: undefined,
});
