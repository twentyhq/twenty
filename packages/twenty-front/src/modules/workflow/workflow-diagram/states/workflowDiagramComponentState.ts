import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const workflowDiagramComponentState = createAtomComponentState<
  WorkflowDiagram | undefined
>({
  key: 'workflowDiagramComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
