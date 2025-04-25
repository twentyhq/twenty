import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramCanvasLoader } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasLoader';
import { WorkflowDiagramCreateStepNode } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditable';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';
import { useSetRecoilState } from 'recoil';

export const WorkflowDiagramCanvasEditable = ({
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

  return (
    <WorkflowDiagramCanvasLoader
      canvasComponent={
        <ReactFlowProvider>
          <WorkflowDiagramCanvasBase
            nodeTypes={{
              default: WorkflowDiagramStepNodeEditable,
              'create-step': WorkflowDiagramCreateStepNode,
              'empty-trigger': WorkflowDiagramEmptyTrigger,
            }}
            edgeTypes={{
              default: WorkflowDiagramDefaultEdge,
            }}
            tagContainerTestId="workflow-visualizer-status"
            tagColor={tagProps.color}
            tagText={tagProps.text}
            onInit={() => {
              setWorkflowDiagramStatus('done');
            }}
          />

          <WorkflowDiagramCanvasEditableEffect />
        </ReactFlowProvider>
      }
      skeletonTagColor={tagProps.color}
      skeletonTagText={tagProps.text}
    />
  );
};
