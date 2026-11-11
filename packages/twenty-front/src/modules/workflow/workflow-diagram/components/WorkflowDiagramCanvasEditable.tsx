import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useReconnectWorkflowEdge } from '@/workflow/workflow-diagram/hooks/useReconnectWorkflowEdge';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import {
  type WorkflowConnection,
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getDisplayedWorkflowDiagramWithDroppedNode } from '@/workflow/workflow-diagram/utils/getDisplayedWorkflowDiagramWithDroppedNode';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { hasUnpositionedWorkflowNode } from '@/workflow/workflow-diagram/utils/hasUnpositionedWorkflowNode';
import { WorkflowDiagramBlankEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramBlankEdge';
import { WorkflowDiagramDefaultEdgeEditable } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramDefaultEdgeEditable';
import { getConnectionOptionsForSourceHandle } from '@/workflow/workflow-diagram/workflow-edges/utils/getConnectionOptionsForSourceHandle';
import { WorkflowDiagramEmptyTriggerEditable } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramEmptyTriggerEditable';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeEditable';
import { useCreateEdge } from '@/workflow/workflow-steps/hooks/useCreateEdge';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { prepareIfElseStepWithNewBranch } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/prepareIfElseStepWithNewBranch';
import { useUpdateTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateTrigger';
import { useUpdateWorkflowVersionPositions } from '@/workflow/workflow-version/hooks/useUpdateWorkflowVersionPositions';
import {
  addEdge,
  ReactFlowProvider,
  reconnectEdge as reconnectDiagramEdge,
  type OnNodeDrag,
  type OnReconnect,
} from '@xyflow/react';
import { useStore } from 'jotai';
import { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { logError } from '~/utils/logError';

export const WorkflowDiagramCanvasEditable = () => {
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const setWorkflowDiagram = useSetAtomComponentState(
    workflowDiagramComponentState,
  );
  const workflowDiagramCallbackState = useAtomComponentStateCallbackState(
    workflowDiagramComponentState,
  );
  const store = useStore();

  const setWorkflowDiagramRightClickMenuPosition = useSetAtomComponentState(
    workflowDiagramRightClickMenuPositionState,
  );

  const { createEdge } = useCreateEdge();

  const { deleteEdge } = useDeleteEdge();
  const { reconnectEdge: persistReconnectedEdge } = useReconnectWorkflowEdge();
  // Queue UI and persistence so rollback starts from the last saved edge.
  // oxlint-disable-next-line twenty/no-state-useref
  const reconnectionQueueRef = useRef<Promise<void>>(Promise.resolve());

  const { updateStep, updateStepNow } = useUpdateStep();

  const { updateTrigger } = useUpdateTrigger();

  const { updateWorkflowVersionPositions } =
    useUpdateWorkflowVersionPositions();

  const { startNodeCreation } = useStartNodeCreation();

  const flow = useAtomComponentStateValue(flowComponentState);

  const onConnect = async (edgeConnect: WorkflowConnection) => {
    const steps = flow?.steps;
    const sourceStep = isDefined(steps)
      ? steps.find((step) => step.id === edgeConnect.source)
      : undefined;

    if (sourceStep?.type === 'IF_ELSE') {
      const updatedStep = prepareIfElseStepWithNewBranch({
        parentStep: sourceStep,
        targetStepId: edgeConnect.target,
      });

      await updateStepNow(updatedStep);
    }

    setWorkflowDiagram((diagram) => {
      if (isDefined(diagram) === false) {
        throw new Error(
          doNotTranslate(
            'It must be impossible for the edges to be updated if the diagram is not defined yet. Be sure the diagram is rendered only when defined.',
          ),
        );
      }

      return {
        ...diagram,
        edges: addEdge<WorkflowDiagramEdge>(edgeConnect, diagram.edges),
      };
    });

    if (sourceStep?.type === 'IF_ELSE') {
      return;
    }

    createEdge({
      source: edgeConnect.source,
      target: edgeConnect.target,
      connectionOptions: getConnectionOptionsForSourceHandle({
        sourceHandleId: edgeConnect.sourceHandle,
      }),
    });
  };

  const onDeleteEdge = async (edge: WorkflowDiagramEdge) => {
    await deleteEdge({
      source: edge.source,
      target: edge.target,
    });
  };

  const onReconnect: OnReconnect<WorkflowDiagramEdge> = (
    oldEdge,
    connection,
  ) => {
    const reconnection = reconnectionQueueRef.current.then(async () => {
      let edgeBeforeReconnect = oldEdge;

      setWorkflowDiagram((diagram) => {
        if (!isDefined(diagram)) {
          return diagram;
        }

        edgeBeforeReconnect =
          diagram.edges.find((edge) => edge.id === oldEdge.id) ?? oldEdge;

        return {
          ...diagram,
          edges: reconnectDiagramEdge(
            edgeBeforeReconnect,
            connection,
            diagram.edges,
            {
              shouldReplaceId: false,
            },
          ),
        };
      });

      let wasSaved = false;

      try {
        wasSaved = await persistReconnectedEdge(
          edgeBeforeReconnect,
          connection,
        );
      } finally {
        if (!wasSaved) {
          setWorkflowDiagram((diagram) => {
            if (!isDefined(diagram)) {
              return diagram;
            }

            return {
              ...diagram,
              edges: diagram.edges.map((edge) =>
                edge.id === edgeBeforeReconnect.id ? edgeBeforeReconnect : edge,
              ),
            };
          });
        }
      }
    });

    reconnectionQueueRef.current = reconnection.then(
      () => undefined,
      () => undefined,
    );

    return reconnection;
  };

  const persistDisplayedLayoutWithDraggedNode = (
    draggedNode: Pick<WorkflowDiagramNode, 'id' | 'position'>,
  ) => {
    const workflowDiagram = store.get(workflowDiagramCallbackState);

    if (!isDefined(workflowDiagram)) {
      return;
    }

    const displayedWorkflowDiagram = getDisplayedWorkflowDiagramWithDroppedNode(
      {
        diagram: workflowDiagram,
        flow,
        droppedNode: draggedNode,
      },
    );

    setWorkflowDiagram(displayedWorkflowDiagram);

    updateWorkflowVersionPositions(
      displayedWorkflowDiagram.nodes.map(({ id, position }) => ({
        id,
        position,
      })),
    ).catch(logError);
  };

  const onNodeDragStop: OnNodeDrag<WorkflowDiagramNode> = async (_, node) => {
    if (isDefined(flow) && hasUnpositionedWorkflowNode(flow)) {
      persistDisplayedLayoutWithDraggedNode(node);

      return;
    }

    const stepToUpdate = flow?.steps?.find((step) => step.id === node.id);

    if (isDefined(stepToUpdate)) {
      updateStep({
        ...stepToUpdate,
        position: node.position,
      });

      return;
    }

    const triggerToUpdate = flow?.trigger;

    if (isDefined(triggerToUpdate)) {
      updateTrigger({
        ...triggerToUpdate,
        position: node.position,
      });

      return;
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
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeEditable,
          'empty-trigger': WorkflowDiagramEmptyTriggerEditable,
          empty: WorkflowDiagramStepNodeEditable,
        }}
        edgeTypes={{
          blank: WorkflowDiagramBlankEdge,
          editable: WorkflowDiagramDefaultEdgeEditable,
        }}
        tagContainerTestId="workflow-visualizer-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onNodeDragStop={onNodeDragStop}
        handlePaneContextMenu={handlePaneContextMenu}
        nodesConnectable
        nodesDraggable
        onDeleteEdge={onDeleteEdge}
        startNodeCreation={startNodeCreation}
      />

      <WorkflowDiagramCanvasEditableEffect />
    </ReactFlowProvider>
  );
};
