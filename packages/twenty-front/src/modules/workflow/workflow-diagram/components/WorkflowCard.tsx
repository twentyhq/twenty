import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowVersionPreviewEffect } from '@/object-core/workflows/versions/components/CoreWorkflowVersionPreviewEffect';
import { usePreviewWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewWorkflowVersion';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
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
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const { previewedWorkflowVersion } = usePreviewWorkflowVersion(
    targetRecord.id,
  );
  const previewedWorkflowVersionOnMainSurface = isInSidePanel
    ? undefined
    : previewedWorkflowVersion;

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: targetRecord.id,
        }),
      }}
    >
      <CoreWorkflowVersionPreviewEffect workflowId={targetRecord.id} />
      {isDefined(previewedWorkflowVersionOnMainSurface) ? (
        <>
          <WorkflowVersionVisualizerEffect
            workflowVersionId={
              previewedWorkflowVersionOnMainSurface.workspaceWorkflowVersionId
            }
          />
          <WorkflowVersionVisualizer
            workflowVersionId={
              previewedWorkflowVersionOnMainSurface.workspaceWorkflowVersionId
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
