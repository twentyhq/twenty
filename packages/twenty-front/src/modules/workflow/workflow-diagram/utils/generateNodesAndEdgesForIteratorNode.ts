import {
  type WorkflowIteratorAction,
  type WorkflowStep,
} from '@/workflow/types/Workflow';
import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import {
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
  type WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getEdgePathStrategy } from '@/workflow/workflow-diagram/utils/getEdgePathStrategy';
import { getEdgeTypeBetweenTwoNodes } from '@/workflow/workflow-diagram/utils/getEdgeTypeBetweenTwoNodes';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowVisualizerEdgeDefaultConfiguration';
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
  steps,
  xPos,
  yPos,
  nodes,
  edges,
  workflowContext,
}: {
  step: WorkflowIteratorAction;
  steps: WorkflowStep[];
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

  for (const initialLoopStepId of initialLoopStepIds) {
    updatedEdges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: edgeTypeBetweenTwoNodes,
      id: v4(),
      source: step.id,
      sourceHandle: WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID,
      target: initialLoopStepId,
      ...(workflowContext === 'workflow'
        ? {
            deletable: true,
            selectable: true,
            reconnectable: 'target',
          }
        : {}),
      targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
      data: {
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION.data,
        labelOptions: {
          position: Position.Right,
          label: msg`loop`,
        },
        edgePathStrategy: 'smooth-step-path-to-target',
      },
    });
  }

  if (isNonEmptyArray(step.nextStepIds)) {
    for (const nextStepId of step.nextStepIds) {
      updatedEdges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: edgeTypeBetweenTwoNodes,
        id: v4(),
        source: step.id,
        sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
        target: nextStepId,
        ...(workflowContext === 'workflow'
          ? {
              deletable: true,
              selectable: true,
              reconnectable: 'target',
            }
          : {}),
        targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
        data: {
          ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION.data,
          labelOptions: {
            position: Position.Bottom,
            label: msg`completed`,
          },
          edgePathStrategy: getEdgePathStrategy({
            step,
            steps,
            nextStepId,
          }),
        },
      });
    }
  }

  return {
    nodes: updatedNodes,
    edges: updatedEdges,
  };
};
