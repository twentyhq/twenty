import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagramBlankEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramBlankEdge';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramDefaultEdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeEditable';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramFilterEdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilterEdgeEditable';
import { WorkflowDiagramFilteringDisabledEdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilteringDisabledEdgeEditable';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditable';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { addEdge, Connection, ReactFlowProvider } from '@xyflow/react';
import { useCreateEdge } from '@/workflow/workflow-steps/hooks/useCreateEdge';
import { isDefined } from 'twenty-shared/utils';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';

export const WorkflowDiagramCanvasEditable = ({
  workflowWithCurrentVersion,
}: {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion;
}) => {
  const tagProps = getWorkflowVersionStatusTagProps({
    workflowVersionStatus: workflowWithCurrentVersion.currentVersion.status,
  });

  const setWorkflowDiagram = useSetRecoilComponentStateV2(
    workflowDiagramComponentState,
  );

  const { createEdge } = useCreateEdge({
    workflow: workflowWithCurrentVersion,
  });

  const onConnect = (edgeConnect: Connection) => {
    setWorkflowDiagram((diagram) => {
      if (isDefined(diagram) === false) {
        throw new Error(
          'It must be impossible for the edges to be updated if the diagram is not defined yet. Be sure the diagram is rendered only when defined.',
        );
      }

      return {
        ...diagram,
        edges: addEdge(edgeConnect, diagram.edges),
      };
    });
    createEdge?.(edgeConnect);
  };

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
          'filtering-disabled--editable':
            WorkflowDiagramFilteringDisabledEdgeEditable,
          'empty-filter--editable': WorkflowDiagramDefaultEdgeEditable,
          'filter--editable': WorkflowDiagramFilterEdgeEditable,
        }}
        tagContainerTestId="workflow-visualizer-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
        onConnect={onConnect}
      />

      <WorkflowDiagramCanvasEditableEffect />
    </ReactFlowProvider>
  );
};
