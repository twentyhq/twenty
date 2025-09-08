import {
  type WorkflowStep,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { FIRST_NODE_POSITION } from '@/workflow/workflow-diagram/constants/FirstNodePosition';
import { VERTICAL_DISTANCE_BETWEEN_TWO_NODES } from '@/workflow/workflow-diagram/constants/VerticalDistanceBetweenTwoNodes';
import {
  type WorkflowDiagram,
  type WorkflowDiagramEdge,
  type WorkflowDiagramEdgeType,
  type WorkflowDiagramIteratorEmptyActionNodeData,
  type WorkflowDiagramNode,
  type WorkflowDiagramNodeDefaultHandleOptions,
  type WorkflowDiagramNodeRightHandleOptions,
  type WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowVisualizerEdgeDefaultConfiguration';

import { WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEmptyTriggerNodeDefinition';
import { WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramIteratorNodeLoopHandleId';
import { getRootStepIds } from '@/workflow/workflow-trigger/utils/getRootStepIds';
import { msg } from '@lingui/core/macro';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

export const generateWorkflowDiagram = ({
  trigger,
  steps,
  edgeTypeBetweenTwoDefaultNodes,
  edgeTypeForIteratorLoopBranch,
  edgeTypeForIteratorCompletedBranch,
  isWorkflowBranchEnabled = false,
}: {
  trigger: WorkflowTrigger | undefined;
  steps: Array<WorkflowStep>;
  edgeTypeBetweenTwoDefaultNodes: WorkflowDiagramEdgeType;
  edgeTypeForIteratorLoopBranch: WorkflowDiagramEdgeType;
  edgeTypeForIteratorCompletedBranch: WorkflowDiagramEdgeType;
  isWorkflowBranchEnabled?: boolean;
}): WorkflowDiagram => {
  const nodes: Array<WorkflowDiagramNode> = [];
  const edges: Array<WorkflowDiagramEdge> = [];

  if (isDefined(trigger)) {
    nodes.push(getWorkflowDiagramTriggerNode({ trigger }));
  } else {
    nodes.push(WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION);

    const triggerNextStepIds =
      isDefined(steps) && !isWorkflowBranchEnabled ? getRootStepIds(steps) : [];

    triggerNextStepIds.forEach((stepId) => {
      edges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: 'blank',
        id: v4(),
        source: 'trigger',
        target: stepId,
      });
    });
  }

  let levelYPos = FIRST_NODE_POSITION.y;

  const xPos = FIRST_NODE_POSITION.x;

  for (const step of steps) {
    levelYPos += VERTICAL_DISTANCE_BETWEEN_TWO_NODES;

    let defaultHandleOptions:
      | WorkflowDiagramNodeDefaultHandleOptions
      | undefined;
    let rightHandleOptions: WorkflowDiagramNodeRightHandleOptions | undefined;

    if (step.type === 'ITERATOR') {
      defaultHandleOptions = {
        label: msg`completed`,
      };

      rightHandleOptions = {
        id: WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID,
      };
    }

    nodes.push({
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
          y: levelYPos,
        },
        defaultHandleOptions,
        rightHandleOptions,
      } satisfies WorkflowDiagramStepNodeData,
      position: step.position ?? {
        x: xPos,
        y: levelYPos,
      },
    });
  }

  for (const stepLinkToTriggerId of trigger?.nextStepIds ?? []) {
    edges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: edgeTypeBetweenTwoDefaultNodes,
      id: v4(),
      source: TRIGGER_STEP_ID,
      target: stepLinkToTriggerId,
      ...(edgeTypeBetweenTwoDefaultNodes.includes('editable')
        ? { deletable: true, selectable: true }
        : {}),
    });
  }

  for (const step of steps) {
    if (step.type === 'ITERATOR') {
      const initialLoopStepIds = Array.isArray(
        step.settings.input.initialLoopStepIds,
      )
        ? step.settings.input.initialLoopStepIds
        : isNonEmptyString(step.settings.input.initialLoopStepIds)
          ? [step.settings.input.initialLoopStepIds]
          : [];

      if (isNonEmptyArray(initialLoopStepIds)) {
        for (const initialLoopStepId of initialLoopStepIds) {
          edges.push({
            ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
            type: edgeTypeForIteratorLoopBranch,
            id: v4(),
            source: step.id,
            sourceHandle: WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID,
            target: initialLoopStepId,
            ...(edgeTypeForIteratorLoopBranch.includes('editable')
              ? { deletable: true, selectable: true }
              : {}),
          });
        }
      } else {
        const emptyNodeId = `${step.id}-empty-loop`;
        const iteratorNode = nodes.find((n) => n.id === step.id);

        if (!isDefined(iteratorNode)) {
          throw new Error('Iterator node is expected to be found');
        }

        nodes.push({
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

        edges.push({
          ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
          type: edgeTypeForIteratorLoopBranch,
          id: v4(),
          source: step.id,
          sourceHandle: 'loop',
          target: emptyNodeId,
          ...(edgeTypeForIteratorLoopBranch.includes('editable')
            ? { deletable: true, selectable: true }
            : {}),
        });

        edges.push({
          ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
          type: edgeTypeBetweenTwoDefaultNodes,
          id: v4(),
          source: emptyNodeId,
          target: step.id,
          ...(edgeTypeBetweenTwoDefaultNodes.includes('editable')
            ? { deletable: true, selectable: true }
            : {}),
        });
      }
    }

    const edgeType =
      step.type === 'ITERATOR'
        ? edgeTypeForIteratorCompletedBranch
        : edgeTypeBetweenTwoDefaultNodes;

    step.nextStepIds?.forEach((child) => {
      edges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: edgeType,
        id: v4(),
        source: step.id,
        target: child,
        ...(edgeType.includes('editable')
          ? { deletable: true, selectable: true }
          : {}),
      });
    });
  }

  return {
    nodes,
    edges,
  };
};
