import { type WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramDefaultEdgeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeReadonly';

import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { WorkflowDiagramEmptyTriggerReadonly } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramEmptyTriggerReadonly';
import { WorkflowDiagramFilterEdgeReadonly } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramFilterEdgeReadonly';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeReadonly';
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
          'empty-trigger': WorkflowDiagramEmptyTriggerReadonly,
        }}
        edgeTypes={{
          'empty-filter--readonly': WorkflowDiagramDefaultEdgeReadonly,
          'filter--readonly': WorkflowDiagramFilterEdgeReadonly,
        }}
        tagContainerTestId="workflow-visualizer-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
      />
    </ReactFlowProvider>
  );
};
