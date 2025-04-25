import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasLoader } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasLoader';
import { WorkflowDiagramCanvasReadonlyEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonlyEffect';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramSuccessEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramSuccessEdge';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';
import { useSetRecoilState } from 'recoil';

export const WorkflowDiagramCanvasReadonly = ({
  versionStatus,
}: {
  versionStatus: WorkflowVersionStatus;
}) => {
  const tagProps = getWorkflowVersionStatusTagProps({
    workflowVersionStatus: versionStatus,
  });

  const setWorkflowDiagramStatus = useSetRecoilState(
    workflowDiagramStatusState,
  );

  const handleInit = () => {
    setWorkflowDiagramStatus('done');
  };

  return (
    <WorkflowDiagramCanvasLoader
      canvasComponent={
        <ReactFlowProvider>
          <WorkflowDiagramCanvasBase
            nodeTypes={{
              default: WorkflowDiagramStepNodeReadonly,
              'empty-trigger': WorkflowDiagramEmptyTrigger,
            }}
            edgeTypes={{
              default: WorkflowDiagramDefaultEdge,
              success: WorkflowDiagramSuccessEdge,
            }}
            tagContainerTestId="workflow-visualizer-status"
            tagColor={tagProps.color}
            tagText={tagProps.text}
            onInit={handleInit}
          />

          <WorkflowDiagramCanvasReadonlyEffect />
        </ReactFlowProvider>
      }
      skeletonTagColor={tagProps.color}
      skeletonTagText={tagProps.text}
    />
  );
};
