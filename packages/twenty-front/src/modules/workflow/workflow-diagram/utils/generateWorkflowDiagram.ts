import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramEmptyTriggerNodeData,
  WorkflowDiagramNode,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';

import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { isDefined } from 'twenty-shared';
import { v4 } from 'uuid';

export const generateWorkflowDiagram = ({
  trigger,
  steps,
}: {
  trigger: WorkflowTrigger | undefined;
  steps: Array<WorkflowStep>;
}): WorkflowDiagram => {
  const nodes: Array<WorkflowDiagramNode> = [];
  const edges: Array<WorkflowDiagramEdge> = [];

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
        isLeafNode: false,
      } satisfies WorkflowDiagramStepNodeData,
      position: {
        x: xPos,
        y: yPos,
      },
    });

    edges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      id: v4(),
      source: parentNodeId,
      target: nodeId,
    });

    return nodeId;
  };

  const triggerNodeId = TRIGGER_STEP_ID;

  if (isDefined(trigger)) {
    let triggerDefaultLabel: string;
    let triggerIcon: string | undefined;

    switch (trigger.type) {
      case 'MANUAL': {
        triggerDefaultLabel = 'Manual Trigger';
        triggerIcon = getTriggerIcon({
          type: 'MANUAL',
        });

        break;
      }
      case 'CRON': {
        triggerDefaultLabel = 'On a Schedule';
        triggerIcon = getTriggerIcon({
          type: 'CRON',
        });

        break;
      }
      case 'DATABASE_EVENT': {
        const triggerEvent = splitWorkflowTriggerEventName(
          trigger.settings.eventName,
        );

        triggerDefaultLabel =
          DATABASE_TRIGGER_TYPES.find(
            (item) => item.event === triggerEvent.event,
          )?.defaultLabel ?? '';

        triggerIcon = getTriggerIcon({
          type: 'DATABASE_EVENT',
          eventName: triggerEvent.event,
        });

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
        name: isDefined(trigger.name) ? trigger.name : triggerDefaultLabel,
        icon: triggerIcon,
        isLeafNode: false,
      } satisfies WorkflowDiagramStepNodeData,
      position: {
        x: 0,
        y: 0,
      },
    });
  } else {
    nodes.push({
      id: triggerNodeId,
      type: 'empty-trigger',
      data: {
        nodeType: 'empty-trigger',
        isLeafNode: false,
      } satisfies WorkflowDiagramEmptyTriggerNodeData,
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
