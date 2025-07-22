import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramBlankEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramBlankEdge';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramDefaultEdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeEditable';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramFilterEdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilterEdgeEditable';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditable';
import { WorkflowDiagramV1EdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramV1EdgeEditable';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowDiagramCanvasEditable = ({
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
          default: WorkflowDiagramStepNodeEditable,
          'create-step': WorkflowDiagramCreateStepNode,
          'empty-trigger': WorkflowDiagramEmptyTrigger,
        }}
        edgeTypes={{
          blank: WorkflowDiagramBlankEdge,
          'v1-editable': WorkflowDiagramV1EdgeEditable,
          'empty-filter-editable': WorkflowDiagramDefaultEdgeEditable,
          'filter-editable': WorkflowDiagramFilterEdgeEditable,
        }}
        tagContainerTestId="workflow-visualizer-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
      />

      <WorkflowDiagramCanvasEditableEffect />
    </ReactFlowProvider>
  );
};
