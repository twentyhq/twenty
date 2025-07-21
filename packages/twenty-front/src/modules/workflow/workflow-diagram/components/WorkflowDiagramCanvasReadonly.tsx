import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasReadonlyEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonlyEffect';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramV1EdgeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramV1EdgeReadonly';
import { WorkflowVisualizerDiagramContextProvider } from '@/workflow/workflow-diagram/contexts/WorkflowVisualizerDiagramContext';
import { useOpenWorkflowViewFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowViewFilterInCommandMenu';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowDiagramCanvasReadonly = ({
  versionStatus,
}: {
  versionStatus: WorkflowVersionStatus;
}) => {
  const tagProps = getWorkflowVersionStatusTagProps({
    workflowVersionStatus: versionStatus,
  });

  const { openWorkflowViewFilterInCommandMenu } =
    useOpenWorkflowViewFilterInCommandMenu();

  return (
    <WorkflowVisualizerDiagramContextProvider
      value={{
        openFilterInCommandMenu: openWorkflowViewFilterInCommandMenu,
      }}
    >
      <ReactFlowProvider>
        <WorkflowDiagramCanvasBase
          nodeTypes={{
            default: WorkflowDiagramStepNodeReadonly,
            'empty-trigger': WorkflowDiagramEmptyTrigger,
          }}
          edgeTypes={{
            default: WorkflowDiagramDefaultEdge,
            v1: WorkflowDiagramV1EdgeReadonly,
          }}
          tagContainerTestId="workflow-visualizer-status"
          tagColor={tagProps.color}
          tagText={tagProps.text}
        />

        <WorkflowDiagramCanvasReadonlyEffect />
      </ReactFlowProvider>
    </WorkflowVisualizerDiagramContextProvider>
  );
};
