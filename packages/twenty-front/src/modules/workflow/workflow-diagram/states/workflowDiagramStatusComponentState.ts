import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowRunVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowRunVisualizerComponentInstanceContext';

// This state must be fresh every time the Reactflow component is mounted.
// We use another instance context whose instanceId is an id unique to the component hierarchy.
export const workflowDiagramStatusComponentState = createComponentStateV2<
  'computing-diagram' | 'computing-dimensions' | 'done'
>({
  key: 'workflowDiagramStatusComponentState',
  defaultValue: 'computing-diagram',
  componentInstanceContext: WorkflowRunVisualizerComponentInstanceContext,
});
