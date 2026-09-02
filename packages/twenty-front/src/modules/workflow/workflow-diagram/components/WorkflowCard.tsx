import { isDefined } from 'twenty-shared/utils';

import { usePreviewWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewWorkflowVersion';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowSSESubscribeEffect } from '@/workflow/workflow-diagram/components/WorkflowSSESubscribeEffect';
import { WorkflowVersionVisualizer } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizer';
import { WorkflowVersionVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizerEffect';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const WorkflowCard = () => {
  const targetRecord = useTargetRecord();
  const { previewedWorkflowVersion } = usePreviewWorkflowVersion(
    targetRecord.id,
  );

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: targetRecord.id,
        }),
      }}
    >
      {isDefined(previewedWorkflowVersion) ? (
        <>
          <WorkflowVersionVisualizerEffect
            workflowVersionId={
              previewedWorkflowVersion.workspaceWorkflowVersionId
            }
          />
          <WorkflowVersionVisualizer
            workflowVersionId={
              previewedWorkflowVersion.workspaceWorkflowVersionId
            }
          />
        </>
      ) : (
        <>
          <WorkflowVisualizerEffect workflowId={targetRecord.id} />
          <WorkflowSSESubscribeEffect workflowId={targetRecord.id} />
          <WorkflowDiagramEffect />
          <WorkflowDiagramCanvasEditable />
        </>
      )}
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
