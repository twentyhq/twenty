import { type WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramDefaultEdgeRun } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeRun';
import { WorkflowDiagramFilterEdgeRun } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilterEdgeRun';

import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
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
          'empty-filter--run': WorkflowDiagramDefaultEdgeRun,
          'filter--run': WorkflowDiagramFilterEdgeRun,
        }}
        tagContainerTestId="workflow-run-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
      />
    </ReactFlowProvider>
  );
};
