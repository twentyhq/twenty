import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramDefaultEdgeRun } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeRun';
import { WorkflowDiagramFilterEdgeRun } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilterEdgeRun';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramV1EdgeRun } from '@/workflow/workflow-diagram/components/WorkflowDiagramV1EdgeRun';
import { WorkflowRunDiagramCanvasEffect } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvasEffect';
import { WorkflowVisualizerDiagramContextProvider } from '@/workflow/workflow-diagram/contexts/WorkflowVisualizerDiagramContext';
import { useHandleWorkflowRunDiagramCanvasInit } from '@/workflow/workflow-diagram/hooks/useHandleWorkflowRunDiagramCanvasInit';
import { useOpenWorkflowRunFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowRunFilterInCommandMenu';
import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';

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
            'v1-run': WorkflowDiagramV1EdgeRun,
            'empty-filter-run': WorkflowDiagramDefaultEdgeRun,
            'filter-run': WorkflowDiagramFilterEdgeRun,
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
