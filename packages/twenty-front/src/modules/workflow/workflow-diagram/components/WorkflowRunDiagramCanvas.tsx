import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramSuccessEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramSuccessEdge';
import { WorkflowRunDiagramCanvasEffect } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvasEffect';
import { WorkflowVisualizerDiagramContextProvider } from '@/workflow/workflow-diagram/contexts/WorkflowVisualizerDiagramContext';
import { useHandleWorkflowRunDiagramCanvasInit } from '@/workflow/workflow-diagram/hooks/useHandleWorkflowRunDiagramCanvasInit';
import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';
import { StepStatus } from 'twenty-shared/workflow';
import { IconFilter } from 'twenty-ui/display';

export const WorkflowRunDiagramCanvas = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}) => {
  const tagProps = getWorkflowRunStatusTagProps({
    workflowRunStatus,
  });

  const { handleWorkflowRunDiagramCanvasInit } =
    useHandleWorkflowRunDiagramCanvasInit();

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowVisualizerWorkflowRunId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  return (
    <WorkflowVisualizerDiagramContextProvider
      value={{
        openFilterInCommandMenu: () => {
          if (!workflowVisualizerWorkflowId) {
            throw new Error('Workflow ID is required');
          }

          if (!workflowVisualizerWorkflowRunId) {
            throw new Error('Workflow run ID is required');
          }

          // For workflow runs, we open the run view step in command menu with filter details
          openWorkflowRunViewStepInCommandMenu({
            workflowId: workflowVisualizerWorkflowId,
            workflowRunId: workflowVisualizerWorkflowRunId,
            title: 'Filter',
            icon: IconFilter,
            workflowSelectedNode: 'filter', // This should be the filter node ID
            stepExecutionStatus: StepStatus.NOT_STARTED, // Default status for filter
          });
        },
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
