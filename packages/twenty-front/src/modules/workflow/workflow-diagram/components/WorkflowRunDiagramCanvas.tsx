import { type WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';

import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
import { WorkflowDiagramDefaultEdgeReadonly } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramDefaultEdgeReadonly';
import { WorkflowRunDiagramStepNode } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowRunDiagramStepNode';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowRunDiagramCanvas = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}) => {
  const tagProps = getWorkflowRunStatusTagProps({
    workflowRunStatus,
  });

  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowRunDiagramStepNode,
        }}
        edgeTypes={{
          readonly: WorkflowDiagramDefaultEdgeReadonly,
        }}
        tagContainerTestId="workflow-run-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
      />
    </ReactFlowProvider>
  );
};
