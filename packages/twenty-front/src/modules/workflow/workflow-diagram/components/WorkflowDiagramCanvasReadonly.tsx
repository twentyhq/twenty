import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasReadonlyEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonlyEffect';
import { WorkflowDiagramDefaultEdgeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeReadonly';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramFilterEdgeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilterEdgeReadonly';
import { WorkflowDiagramFilteringDisabledEdgeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilteringDisabledEdgeReadonly';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
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

  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeReadonly,
          'empty-trigger': WorkflowDiagramEmptyTrigger,
        }}
        edgeTypes={{
          'filtering-disabled--readonly':
            WorkflowDiagramFilteringDisabledEdgeReadonly,
          'empty-filter--readonly': WorkflowDiagramDefaultEdgeReadonly,
          'filter--readonly': WorkflowDiagramFilterEdgeReadonly,
        }}
        tagContainerTestId="workflow-visualizer-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
      />

      <WorkflowDiagramCanvasReadonlyEffect />
    </ReactFlowProvider>
  );
};
