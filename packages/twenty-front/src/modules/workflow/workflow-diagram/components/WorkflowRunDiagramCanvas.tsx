import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramSuccessEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramSuccessEdge';
import { WorkflowRunDiagramCanvasEffect } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvasEffect';
import { WorkflowVisualizerDiagramContextProvider } from '@/workflow/workflow-diagram/contexts/WorkflowVisualizerDiagramContext';
import { useHandleWorkflowRunDiagramCanvasInit } from '@/workflow/workflow-diagram/hooks/useHandleWorkflowRunDiagramCanvasInit';
import { useOpenWorkflowRunFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowRunFilterInCommandMenu';
import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';
import { useIcons } from 'twenty-ui/display';

export const WorkflowRunDiagramCanvas = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}) => {
  const { getIcon } = useIcons();

  const tagProps = getWorkflowRunStatusTagProps({
    workflowRunStatus,
  });

  const { handleWorkflowRunDiagramCanvasInit } =
    useHandleWorkflowRunDiagramCanvasInit();

  const { openWorkflowRunFilterInCommandMenu } =
    useOpenWorkflowRunFilterInCommandMenu();

  return (
    <WorkflowVisualizerDiagramContextProvider
      value={{
        openFilterInCommandMenu: openWorkflowRunFilterInCommandMenu,
      }}
    >
      <ReactFlowProvider>
        <WorkflowDiagramCanvasBase
          nodeTypes={{
            default: WorkflowDiagramStepNodeReadonly,
          }}
          edgeTypes={{
            default: WorkflowDiagramDefaultEdge,
            success: WorkflowDiagramSuccessEdge,
          }}
          tagContainerTestId="workflow-run-status"
          tagColor={tagProps.color}
          tagText={tagProps.text}
          onInit={handleWorkflowRunDiagramCanvasInit}
        />

        <WorkflowRunDiagramCanvasEffect />
      </ReactFlowProvider>
    </WorkflowVisualizerDiagramContextProvider>
  );
};
