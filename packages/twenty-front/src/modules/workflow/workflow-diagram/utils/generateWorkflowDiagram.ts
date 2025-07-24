import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import { FIRST_NODE_POSITION } from '@/workflow/workflow-diagram/constants/FirstNodePosition';
import { VERTICAL_DISTANCE_BETWEEN_TWO_NODES } from '@/workflow/workflow-diagram/constants/VerticalDistanceBetweenTwoNodes';
import { WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEmptyTriggerNodeDefinition';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeType,
  WorkflowDiagramNode,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';

import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

/**
 * Groups workflow steps into levels based on their distance from root nodes.
 *
 * A root node is one that is not referenced as a `nextStepId` by any other step.
 * The function performs a breadth-first traversal from all roots and assigns
 * each step to a level indicating its depth in the graph.
 *
 * Returns an array where each sub-array contains all steps at the same level.
 */
const groupStepsByLevel = (steps: WorkflowStep[]): WorkflowStep[][] => {
  const stepMap = new Map<string, WorkflowStep>();

  const childIds = new Set<string>();

  for (const step of steps) {
    stepMap.set(step.id, step);
    step.nextStepIds?.forEach((id) => childIds.add(id));
  }

  const rootSteps = steps.filter((step) => !childIds.has(step.id));

  const stepsByLevel: WorkflowStep[][] = [];

  const visited = new Set<string>();

  const visit = ({ step, level }: { step: WorkflowStep; level: number }) => {
    if (visited.has(step.id)) {
      return;
    }

    visited.add(step.id);

    if (!isDefined(stepsByLevel[level])) {
      stepsByLevel[level] = [];
    }

    stepsByLevel[level].push(step);

    step.nextStepIds?.forEach((childId) => {
      const child = stepMap.get(childId);

      if (isDefined(child)) {
        visit({ step: child, level: level + 1 });
      }
    });
  };

  rootSteps.forEach((root) => visit({ step: root, level: 0 }));

  return stepsByLevel;
};

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
        position: step.position ?? {
          x: xPos,
          y: levelYPos,
        },
      });
    }
  }

  for (const firstLevelStep of stepsGroupedByLevel[0] || []) {
    edges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: defaultEdgeType,
      ...(defaultEdgeType.includes('editable')
        ? { deletable: true, selectable: true }
        : {}),
      id: v4(),
      source: TRIGGER_STEP_ID,
      target: firstLevelStep.id,
    });
  }

  for (const step of steps) {
    step.nextStepIds?.forEach((child) => {
      edges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: defaultEdgeType,
        ...(defaultEdgeType.includes('editable')
          ? { deletable: true, selectable: true }
          : {}),
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
