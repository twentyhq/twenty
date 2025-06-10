import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import { FIRST_NODE_POSITION } from '@/workflow/workflow-diagram/constants/FirstNodePosition';
import { VERTICAL_DISTANCE_BETWEEN_TWO_NODES } from '@/workflow/workflow-diagram/constants/VerticalDistanceBetweenTwoNodes';
import { WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEmptyTriggerNodeDefinition';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';

import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const groupStepsByLevel = (steps: WorkflowStep[]): WorkflowStep[][] => {
  const stepMap = new Map<string, WorkflowStep>();

  const childIds = new Set<string>();

  for (const node of steps) {
    stepMap.set(node.id, node);
    node.nextStepIds?.forEach((id) => childIds.add(id));
  }

  const roots = steps.filter((node) => !childIds.has(node.id));

  const levels: WorkflowStep[][] = [];

  const visited = new Set<string>();

  const queue: [WorkflowStep, number][] = roots.map((root) => [root, 0]);

  while (queue.length) {
    const firstElement = queue.shift();

    if (!isDefined(firstElement)) {
      continue;
    }

    const [node, level] = firstElement;

    if (visited.has(node.id)) {
      continue;
    }

    visited.add(node.id);

    if (!levels[level]) levels[level] = [];

    levels[level].push(node);

    node.nextStepIds?.forEach((childId) => {
      const child = stepMap.get(childId);

      if (isDefined(child)) {
        queue.push([child, level + 1]);
      }
    });
  }

  return levels;
};

export const generateWorkflowDiagram = ({
  trigger,
  steps,
}: {
  trigger: WorkflowTrigger | undefined;
  steps: Array<WorkflowStep>;
}): WorkflowDiagram => {
  const nodes: Array<WorkflowDiagramNode> = [];

  const edges: Array<WorkflowDiagramEdge> = [];

  if (isDefined(trigger)) {
    nodes.push(getWorkflowDiagramTriggerNode({ trigger }));
  } else {
    nodes.push(WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION);
  }

  const stepsGroupedByLevel = groupStepsByLevel(steps);

  let levelYPos = FIRST_NODE_POSITION.y;

  const xPos = FIRST_NODE_POSITION.x;

  for (const stepsByLevel of stepsGroupedByLevel) {
    levelYPos += VERTICAL_DISTANCE_BETWEEN_TWO_NODES;

    for (const step of stepsByLevel) {
      nodes.push({
        id: step.id,
        data: {
          nodeType: 'action',
          actionType: step.type,
          name: step.name,
        } satisfies WorkflowDiagramStepNodeData,
        position: {
          x: xPos,
          y: levelYPos,
        },
      });
    }
  }

  for (const firstLevelStep of stepsGroupedByLevel[0] || []) {
    edges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      id: v4(),
      source: TRIGGER_STEP_ID,
      target: firstLevelStep.id,
    });
  }

  for (const step of steps) {
    step.nextStepIds?.forEach((child) => {
      edges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        id: v4(),
        source: step.id,
        target: child,
      });
    });
  }

  return {
    nodes,
    edges,
  };
};
