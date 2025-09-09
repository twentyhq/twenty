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
  type WorkflowDiagramNode,
  type WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowVisualizerEdgeDefaultConfiguration';

import { WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEmptyTriggerNodeDefinition';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

export const generateWorkflowDiagram = ({
  trigger,
  steps,
  defaultEdgeType,
}: {
  trigger: WorkflowTrigger | undefined;
  steps: Array<WorkflowStep>;
  defaultEdgeType: WorkflowDiagramEdgeType;
}): WorkflowDiagram => {
  const nodes: Array<WorkflowDiagramNode> = [];
  const edges: Array<WorkflowDiagramEdge> = [];

  if (isDefined(trigger)) {
    nodes.push(getWorkflowDiagramTriggerNode({ trigger }));
  } else {
    nodes.push(WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION);
  }

  let levelYPos = FIRST_NODE_POSITION.y;

  const xPos = FIRST_NODE_POSITION.x;

  for (const step of steps) {
    levelYPos += VERTICAL_DISTANCE_BETWEEN_TWO_NODES;

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
      type: defaultEdgeType,
      id: v4(),
      source: TRIGGER_STEP_ID,
      target: stepLinkToTriggerId,
      ...(defaultEdgeType.includes('editable')
        ? { deletable: true, selectable: true }
        : {}),
    });
  }

  for (const step of steps) {
    step.nextStepIds?.forEach((child) => {
      edges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: defaultEdgeType,
        id: v4(),
        source: step.id,
        target: child,
        ...(defaultEdgeType.includes('editable')
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
