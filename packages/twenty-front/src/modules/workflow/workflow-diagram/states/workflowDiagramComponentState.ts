import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const workflowDiagramComponentState = createComponentState<
  WorkflowDiagram | undefined
>({
  key: 'workflowDiagramComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
