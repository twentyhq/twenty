import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowDiagramStatusComponentState = createComponentStateV2<
  'computing-diagram' | 'computing-dimensions' | 'done'
>({
  key: 'workflowDiagramStatusComponentState',
  defaultValue: 'computing-diagram',
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
