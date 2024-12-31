import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import { createState } from '@ui/utilities/state/utils/createState';

export const workflowDiagramState = createState<WorkflowDiagram | undefined>({
  key: 'workflowDiagramState',
  defaultValue: undefined,
});
