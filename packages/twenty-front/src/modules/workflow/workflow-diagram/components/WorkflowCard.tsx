import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowVersionDiagramEffect } from '@/object-core/workflows/versions/components/CoreWorkflowVersionDiagramEffect';
import { CoreWorkflowVersionPreviewBar } from '@/object-core/workflows/versions/components/CoreWorkflowVersionPreviewBar';
import { CoreWorkflowVersionPreviewEffect } from '@/object-core/workflows/versions/components/CoreWorkflowVersionPreviewEffect';
import { usePreviewCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewCoreWorkflowVersion';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramCanvasReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonly';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowSSESubscribeEffect } from '@/workflow/workflow-diagram/components/WorkflowSSESubscribeEffect';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const WorkflowCard = () => {
  const targetRecord = useTargetRecord();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const { previewedCoreWorkflowVersion } = usePreviewCoreWorkflowVersion(
    targetRecord.id,
  );
  const previewedOnMainSurface = isInSidePanel
    ? null
    : previewedCoreWorkflowVersion;

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId:
            previewedOnMainSurface?.workspaceWorkflowVersionId ??
            targetRecord.id,
        }),
      }}
    >
      {!isInSidePanel && (
        <CoreWorkflowVersionPreviewEffect workflowId={targetRecord.id} />
      )}
      {isDefined(previewedOnMainSurface) ? (
        <StyledContainer>
          <CoreWorkflowVersionDiagramEffect
            workflowId={targetRecord.id}
            previewedCoreWorkflowVersion={previewedOnMainSurface}
          />
          <CoreWorkflowVersionPreviewBar
            workflowId={targetRecord.id}
            previewedCoreWorkflowVersion={previewedOnMainSurface}
          />
          <WorkflowDiagramCanvasReadonly
            versionStatus={previewedOnMainSurface.status}
          />
        </StyledContainer>
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
