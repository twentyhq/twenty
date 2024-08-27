import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import { createState } from 'twenty-ui';

export const showPageWorkflowDiagramState = createState<
  WorkflowDiagram | undefined
>({
  key: 'showPageWorkflowDiagramState',
  defaultValue: undefined,
});
