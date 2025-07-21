import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramBlankEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramBlankEdge';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasReadonlyEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonlyEffect';
import { WorkflowDiagramDefaultEdgeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeReadonly';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramFilterEdgeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilterEdgeReadonly';
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
            blank: WorkflowDiagramBlankEdge,
            'v1-readonly': WorkflowDiagramV1EdgeReadonly,
            'empty-filter-readonly': WorkflowDiagramDefaultEdgeReadonly,
            'filter-readonly': WorkflowDiagramFilterEdgeReadonly,
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
