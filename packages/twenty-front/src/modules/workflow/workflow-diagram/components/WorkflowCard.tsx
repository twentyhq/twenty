import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const WorkflowCard = () => {
  const targetRecord = useTargetRecord();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: targetRecord.id,
        }),
      }}
    >
      <WorkflowVisualizerEffect workflowId={targetRecord.id} />
      <WorkflowDiagramEffect />
      <WorkflowDiagramCanvasEditable />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
