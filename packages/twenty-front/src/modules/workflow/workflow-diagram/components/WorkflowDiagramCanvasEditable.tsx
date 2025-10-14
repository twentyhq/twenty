import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useWorkflowDiagramScreenToFlowPosition } from '@/workflow/workflow-diagram/hooks/useWorkflowDiagramScreenToFlowPosition';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import {
  type WorkflowConnection,
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { assertEdgeHasDefinedHandlesOrThrow } from '@/workflow/workflow-diagram/utils/assertEdgeHasDefinedHandlesOrThrow';
import { assertWorkflowConnectionOrThrow } from '@/workflow/workflow-diagram/utils/assertWorkflowConnectionOrThrow';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { WorkflowDiagramBlankEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramBlankEdge';
import { WorkflowDiagramDefaultEdgeEditable } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramDefaultEdgeEditable';
import { getConnectionOptionsForSourceHandle } from '@/workflow/workflow-diagram/workflow-edges/utils/getConnectionOptionsForSourceHandle';
import { WorkflowDiagramEmptyTriggerEditable } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramEmptyTriggerEditable';
import { WorkflowDiagramPlaceholderNode } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramPlaceholderNode';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeEditable';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { useCreateEdge } from '@/workflow/workflow-steps/hooks/useCreateEdge';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import {
  addEdge,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type FinalConnectionState,
} from '@xyflow/react';
import React, { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

const WorkflowDiagramCanvasEditableInner = () => {
  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const setWorkflowDiagram = useSetRecoilComponentState(
    workflowDiagramComponentState,
  );

  const setWorkflowDiagramRightClickMenuPosition = useSetRecoilComponentState(
    workflowDiagramRightClickMenuPositionState,
  );

  const { workflowDiagramScreenToFlowPosition } =
    useWorkflowDiagramScreenToFlowPosition();

  const { createEdge } = useCreateEdge();

  const { deleteEdge } = useDeleteEdge();

  const { updateStep } = useUpdateStep();

  const { updateTrigger } = useUpdateWorkflowVersionTrigger();

  const { startNodeCreation } = useStartNodeCreation();

  const onConnect = (edgeConnect: WorkflowConnection) => {
    setWorkflowDiagram((diagram) => {
      if (!isDefined(diagram)) {
        throw new Error(
          'Workflow diagram must be defined before edges can be updated.',
        );
      }

      return {
        ...diagram,
        edges: addEdge<WorkflowDiagramEdge>(edgeConnect, diagram.edges),
      };
    });

    createEdge({
      source: edgeConnect.source,
      target: edgeConnect.target,
      connectionOptions: getConnectionOptionsForSourceHandle({
        sourceHandleId: edgeConnect.sourceHandle,
      }),
    });
  };

  const handleConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (
        isDefined(connectionState.toNode) ||
        isDefined(connectionState.toHandle)
      ) {
        return;
      }

      const { fromNode, fromHandle } = connectionState;

      if (!isDefined(fromNode) || !isDefined(fromHandle)) {
        return;
      }

      const sourceHandleId =
        fromHandle.id ?? WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID;

      const pointerPosition = (() => {
        if ('clientX' in event) {
          return { x: event.clientX, y: event.clientY };
        }

        const touch = event.changedTouches?.[0];

        if (isDefined(touch)) {
          return { x: touch.clientX, y: touch.clientY };
        }

        return undefined;
      })();

      const dropPosition = isDefined(pointerPosition)
        ? workflowDiagramScreenToFlowPosition(pointerPosition)
        : connectionState.to;

      if (!isDefined(dropPosition)) {
        return;
      }

      const nodeWidth = fromNode.measured?.width ?? 150;
      const nodeHeight = fromNode.measured?.height ?? 32;

      const centeredPosition = {
        x: dropPosition.x - nodeWidth / 2,
        y: dropPosition.y - nodeHeight / 2,
      };

      // Defer to the next tick so ReactFlow finalizes the drop state before we
      // trigger the command menu workflow.
      setTimeout(() => {
        startNodeCreation({
          parentStepId: fromNode.id,
          nextStepId: undefined,
          position: centeredPosition,
          sourceHandleId,
          connectionOptions: getConnectionOptionsForSourceHandle({
            sourceHandleId,
          }),
        });
      }, 0);
    },
    [startNodeCreation, workflowDiagramScreenToFlowPosition],
  );

  const handleReconnect = useCallback(
    async (oldEdge: Edge, connection: Connection) => {
      assertEdgeHasDefinedHandlesOrThrow(oldEdge);
      assertWorkflowConnectionOrThrow(connection);

      await deleteEdge({
        source: oldEdge.source,
        target: oldEdge.target,
        sourceConnectionOptions: getConnectionOptionsForSourceHandle({
          sourceHandleId: oldEdge.sourceHandle,
        }),
      });

      await createEdge({
        source: connection.source,
        target: connection.target,
        connectionOptions: getConnectionOptionsForSourceHandle({
          sourceHandleId: connection.sourceHandle,
        }),
      });
    },
    [deleteEdge, createEdge],
  );

  const onDeleteEdge = async (edge: WorkflowDiagramEdge) => {
    await deleteEdge({
      source: edge.source,
      target: edge.target,
    });
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
    }
  };

  if (!isDefined(workflowWithCurrentVersion)) {
    return null;
  }

  const tagProps = getWorkflowVersionStatusTagProps({
    workflowVersionStatus: workflowWithCurrentVersion.currentVersion.status,
  });

  const handlePaneContextMenu = ({ x, y }: { x: number; y: number }) => {
    setWorkflowDiagramRightClickMenuPosition({
      x,
      y,
    });
  };

  return (
    <>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeEditable,
          'empty-trigger': WorkflowDiagramEmptyTriggerEditable,
          placeholder: WorkflowDiagramPlaceholderNode,
        }}
        edgeTypes={{
          blank: WorkflowDiagramBlankEdge,
          editable: WorkflowDiagramDefaultEdgeEditable,
        }}
        tagContainerTestId="workflow-visualizer-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
        onConnect={onConnect}
        onReconnect={handleReconnect}
        onConnectEnd={handleConnectEnd}
        onNodeDragStop={onNodeDragStop}
        handlePaneContextMenu={handlePaneContextMenu}
        nodesConnectable
        nodesDraggable
        onDeleteEdge={onDeleteEdge}
      />

      <WorkflowDiagramCanvasEditableEffect />
    </>
  );
};

export const WorkflowDiagramCanvasEditable = () => {
  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasEditableInner />
    </ReactFlowProvider>
  );
};
