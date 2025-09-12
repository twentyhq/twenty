import { type WorkflowStep } from '@/workflow/types/Workflow';
import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import {
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
  type WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getEdgeTypeBetweenTwoNodes } from '@/workflow/workflow-diagram/utils/getEdgeTypeBetweenTwoNodes';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import { type WorkflowDiagramIteratorEmptyActionNodeData } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowDiagramIteratorEmptyActionNodeData';
import { WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramIteratorNodeLoopHandleId';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import { msg } from '@lingui/core/macro';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { Position } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const generateNodesAndEdgesForIteratorNode = ({
  step,
  xPos,
  yPos,
  nodes,
  edges,
  workflowContext,
}: {
  step: WorkflowStep & { type: 'ITERATOR' };
  yPos: number;
  xPos: number;
  nodes: readonly WorkflowDiagramNode[];
  edges: readonly WorkflowDiagramEdge[];
  workflowContext: WorkflowContext;
}): {
  nodes: Array<WorkflowDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
} => {
  const edgeTypeBetweenTwoNodes = getEdgeTypeBetweenTwoNodes({
    workflowContext,
  });

  const updatedNodes = [...nodes];
  const updatedEdges = [...edges];

  const iteratorNode: WorkflowDiagramNode = {
    id: step.id,
    data: {
      nodeType: 'action',
      actionType: step.type,
      name: step.name,
      hasNextStepIds:
        isDefined(step.nextStepIds) && step.nextStepIds.length > 0,
      stepId: step.id,
      position: step.position ?? {
        x: xPos,
        y: yPos,
      },
      defaultHandleOptions: {
        label: msg`completed`,
      },
      rightHandleOptions: {
        id: WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID,
      },
    } satisfies WorkflowDiagramStepNodeData,
    position: step.position ?? {
      x: xPos,
      y: yPos,
    },
  };

  updatedNodes.push(iteratorNode);

  const initialLoopStepIds = Array.isArray(
    step.settings.input.initialLoopStepIds,
  )
    ? step.settings.input.initialLoopStepIds
    : isNonEmptyString(step.settings.input.initialLoopStepIds)
      ? [step.settings.input.initialLoopStepIds]
      : [];

  if (isNonEmptyArray(initialLoopStepIds)) {
    for (const initialLoopStepId of initialLoopStepIds) {
      updatedEdges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: edgeTypeBetweenTwoNodes,
        id: v4(),
        source: step.id,
        sourceHandle: WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID,
        target: initialLoopStepId,
        ...(edgeTypeBetweenTwoNodes.includes('editable')
          ? { deletable: true, selectable: true }
          : {}),
        targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
        data: {
          ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION.data,
          labelOptions: {
            position: Position.Right,
            label: msg`loop`,
          },
        },
      });
    }
  } else {
    const emptyNodeId = `${step.id}-empty-loop`;

    updatedNodes.push({
      id: emptyNodeId,
      type: 'iterator-empty-action',
      data: {
        nodeType: 'iterator-empty-action',
        parentIteratorStepId: step.id,
        position: {
          x: iteratorNode.position.x + 175,
          y: iteratorNode.position.y + 75,
        },
      } satisfies WorkflowDiagramIteratorEmptyActionNodeData,
      position: {
        x: iteratorNode.position.x + 175,
        y: iteratorNode.position.y + 75,
      },
      draggable: false,
    });

    updatedEdges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: edgeTypeBetweenTwoNodes,
      id: v4(),
      source: step.id,
      sourceHandle: WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID,
      target: emptyNodeId,
      ...(edgeTypeBetweenTwoNodes.includes('editable')
        ? { deletable: true, selectable: true }
        : {}),
      targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
      data: {
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION.data,
        labelOptions: {
          position: Position.Right,
          label: msg`loop`,
        },
      },
    });

    updatedEdges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: edgeTypeBetweenTwoNodes,
      id: v4(),
      source: emptyNodeId,
      sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
      target: step.id,
      ...(edgeTypeBetweenTwoNodes.includes('editable')
        ? { deletable: true, selectable: true }
        : {}),
      targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
    });
  }

  step.nextStepIds?.forEach((child) => {
    updatedEdges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: edgeTypeBetweenTwoNodes,
      id: v4(),
      source: step.id,
      sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
      target: child,
      ...(edgeTypeBetweenTwoNodes.includes('editable')
        ? { deletable: true, selectable: true }
        : {}),
      targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
      data: {
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION.data,
        labelOptions: {
          position: Position.Bottom,
          label: msg`completed`,
        },
      },
    });
  });

  return {
    nodes: updatedNodes,
    edges: updatedEdges,
  };
};
