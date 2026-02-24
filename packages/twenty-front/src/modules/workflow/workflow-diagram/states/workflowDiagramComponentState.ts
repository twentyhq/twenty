import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const workflowDiagramComponentState = createComponentStateV2<
  WorkflowDiagram | undefined
>({
  key: 'workflowDiagramComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
