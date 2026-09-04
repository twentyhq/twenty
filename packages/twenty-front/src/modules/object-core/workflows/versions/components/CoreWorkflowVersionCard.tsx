import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowVersionDiagramEffect } from '@/object-core/workflows/versions/components/CoreWorkflowVersionDiagramEffect';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowDiagramCanvasReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonly';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CoreWorkflowVersionCard = ({
  workspaceWorkflowVersionId,
}: {
  workspaceWorkflowVersionId: string;
}) => {
  const { coreWorkflowVersion } = useCoreWorkflowVersion(
    workspaceWorkflowVersionId,
  );

  if (!isDefined(coreWorkflowVersion)) {
    return null;
  }

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workspaceWorkflowVersionId,
        }),
      }}
    >
      <CoreWorkflowVersionDiagramEffect
        workflowId={coreWorkflowVersion.workspaceWorkflowId}
        workspaceWorkflowVersionId={workspaceWorkflowVersionId}
        label={coreWorkflowVersion.label}
        status={coreWorkflowVersion.status}
        createdAt={coreWorkflowVersion.createdAt}
        trigger={coreWorkflowVersion.trigger ?? null}
        steps={coreWorkflowVersion.steps ?? null}
      />
      <StyledContainer>
        <WorkflowDiagramCanvasReadonly
          versionStatus={coreWorkflowVersion.status}
        />
      </StyledContainer>
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
