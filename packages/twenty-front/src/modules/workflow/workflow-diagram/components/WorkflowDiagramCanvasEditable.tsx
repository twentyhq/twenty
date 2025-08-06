import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagramBlankEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramBlankEdge';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramDefaultEdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeEditable';
import { WorkflowDiagramEmptyTriggerEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTriggerEditable';
import { WorkflowDiagramFilterEdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilterEdgeEditable';
import { WorkflowDiagramFilteringDisabledEdgeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilteringDisabledEdgeEditable';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditable';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { useCreateEdge } from '@/workflow/workflow-steps/hooks/useCreateEdge';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { addEdge, Connection, ReactFlowProvider } from '@xyflow/react';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowDiagramCanvasEditable = ({
  workflowWithCurrentVersion,
}: {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion;
}) => {
  const tagProps = getWorkflowVersionStatusTagProps({
    workflowVersionStatus: workflowWithCurrentVersion.currentVersion.status,
  });

  const setWorkflowDiagram = useSetRecoilComponentState(
    workflowDiagramComponentState,
  );

  const setWorkflowDiagramRightClickMenuPosition = useSetRecoilComponentState(
    workflowDiagramRightClickMenuPositionState,
  );

  const { createEdge } = useCreateEdge({
    workflow: workflowWithCurrentVersion,
  });

  const { deleteEdge } = useDeleteEdge({
    workflow: workflowWithCurrentVersion,
  });

  const { updateStep } = useUpdateStep({
    workflow: workflowWithCurrentVersion,
  });

  const { updateTrigger } = useUpdateWorkflowVersionTrigger({
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

  const onDeleteEdge = async (edge: WorkflowDiagramEdge) => {
    await deleteEdge(edge);
  };

  const onNodeDragStop = async (
    _: React.MouseEvent<Element>,
    node: WorkflowDiagramNode,
  ) => {
    const stepToUpdate =
      workflowWithCurrentVersion?.currentVersion?.steps?.find(
        (step) => step.id === node.id,
      );

    if (isDefined(stepToUpdate)) {
      await updateStep({
        ...stepToUpdate,
        position: node.position,
      });

      return;
    }

    const triggerToUpdate = workflowWithCurrentVersion?.currentVersion?.trigger;

    if (isDefined(triggerToUpdate)) {
      await updateTrigger({
        ...triggerToUpdate,
        position: node.position,
      });

      return;
    }
  };

  const handlePaneContextMenu = ({ x, y }: { x: number; y: number }) => {
    setWorkflowDiagramRightClickMenuPosition({
      x,
      y,
    });
  };

  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeEditable,
          'empty-trigger': WorkflowDiagramEmptyTriggerEditable,
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
        onNodeDragStop={onNodeDragStop}
        handlePaneContextMenu={handlePaneContextMenu}
        nodesConnectable
        nodesDraggable
        onDeleteEdge={onDeleteEdge}
      />

      <WorkflowDiagramCanvasEditableEffect />
    </ReactFlowProvider>
  );
};
