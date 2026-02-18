import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowSSESubscribeEffect } from '@/workflow/workflow-diagram/components/WorkflowSSESubscribeEffect';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const WorkflowCard = () => {
  const targetRecord = useTargetRecord();
  const isSseDbEventsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SSE_DB_EVENTS_ENABLED,
  );

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: targetRecord.id,
        }),
      }}
    >
      <WorkflowVisualizerEffect workflowId={targetRecord.id} />
      {isSseDbEventsEnabled && (
        <WorkflowSSESubscribeEffect workflowId={targetRecord.id} />
      )}
      <WorkflowDiagramEffect />
      <WorkflowDiagramCanvasEditable />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
