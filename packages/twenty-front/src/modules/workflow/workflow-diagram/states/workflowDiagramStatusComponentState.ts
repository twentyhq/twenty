import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowRunVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowRunVisualizerComponentInstanceContext';
import { WorkflowDiagramStatus } from '@/workflow/workflow-diagram/types/WorkflowDiagramStatus';

// This state must be fresh every time the Reactflow component is mounted.
// We use another instance context whose instanceId is an id unique to the component hierarchy.
export const workflowDiagramStatusComponentState =
  createComponentState<WorkflowDiagramStatus>({
    key: 'workflowDiagramStatusComponentState',
    defaultValue: 'computing-diagram',
    componentInstanceContext: WorkflowRunVisualizerComponentInstanceContext,
  });
