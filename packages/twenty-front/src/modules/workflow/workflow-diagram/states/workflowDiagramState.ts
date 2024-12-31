import { createState } from '@ui/utilities/state/utils/createState';
import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const workflowDiagramState = createState<WorkflowDiagram | undefined>({
  key: 'workflowDiagramState',
  defaultValue: undefined,
});
