import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/types/WorkflowDiagram';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { MarkerType } from '@xyflow/react';
import { isDefined } from 'twenty-ui';
import { v4 } from 'uuid';
import { capitalize } from '~/utils/string/capitalize';

export const generateWorkflowDiagram = ({
  trigger,
  steps,
}: {
  trigger: WorkflowTrigger | undefined;
  steps: Array<WorkflowStep>;
}): WorkflowDiagram => {
  const nodes: Array<WorkflowDiagramNode> = [];
  const edges: Array<WorkflowDiagramEdge> = [];

  // Helper function to generate nodes and edges recursively
  const processNode = (
    step: WorkflowStep,
    parentNodeId: string,
    xPos: number,
    yPos: number,
  ) => {
    const nodeId = step.id;

    nodes.push({
      id: nodeId,
      data: {
        nodeType: 'action',
        actionType: step.type,
        name: step.name,
      },
      position: {
        x: xPos,
        y: yPos,
      },
    });

    // Create an edge from the parent node to this node
    edges.push({
      id: v4(),
      source: parentNodeId,
      target: nodeId,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      deletable: false,
      selectable: false,
    });

    return nodeId;
  };

  // Start with the trigger node
  const triggerNodeId = TRIGGER_STEP_ID;

  if (isDefined(trigger)) {
    let triggerLabel: string;

    switch (trigger.type) {
      case 'MANUAL': {
        triggerLabel = 'Manual Trigger';

        break;
      }
      case 'DATABASE_EVENT': {
        const triggerEvent = splitWorkflowTriggerEventName(
          trigger.settings.eventName,
        );

        triggerLabel = `${capitalize(triggerEvent.objectType)} is ${capitalize(triggerEvent.event)}`;

        break;
      }
      default: {
        return assertUnreachable(
          trigger,
          `Expected the trigger "${JSON.stringify(trigger)}" to be supported.`,
        );
      }
    }

    nodes.push({
      id: triggerNodeId,
      data: {
        nodeType: 'trigger',
        triggerType: trigger.type,
        name: isDefined(trigger.name) ? trigger.name : triggerLabel,
      },
      position: {
        x: 0,
        y: 0,
      },
    });
  } else {
    nodes.push({
      id: triggerNodeId,
      type: 'empty-trigger',
      data: {} as any,
      position: {
        x: 0,
        y: 0,
      },
    });
  }

  let lastStepId = triggerNodeId;

  for (const step of steps) {
    lastStepId = processNode(step, lastStepId, 150, 100);
  }

  return {
    nodes,
    edges,
  };
};
