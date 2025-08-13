import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { type Node } from '@xyflow/react';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const getWorkflowDiagramTriggerNode = ({
  trigger,
}: {
  trigger: WorkflowTrigger;
}): Node<WorkflowDiagramStepNodeData> => {
  let triggerDefaultLabel: string;
  let triggerIcon: string | undefined;

  switch (trigger.type) {
    case 'MANUAL': {
      triggerDefaultLabel = 'Manual trigger';
      triggerIcon = getTriggerIcon(trigger);

      break;
    }
    case 'CRON': {
      triggerDefaultLabel = 'On a schedule';
      triggerIcon = getTriggerIcon(trigger);

      break;
    }
    case 'WEBHOOK': {
      triggerDefaultLabel = 'Webhook';
      triggerIcon = getTriggerIcon(trigger);

      break;
    }
    case 'DATABASE_EVENT': {
      const triggerEvent = splitWorkflowTriggerEventName(
        trigger.settings.eventName,
      );

      triggerDefaultLabel =
        DATABASE_TRIGGER_TYPES.find((item) => item.event === triggerEvent.event)
          ?.defaultLabel ?? '';

      triggerIcon = getTriggerIcon(trigger);

      break;
    }
    default: {
      return assertUnreachable(
        trigger,
        `Expected the trigger "${JSON.stringify(trigger)}" to be supported.`,
      );
    }
  }

  return {
    id: TRIGGER_STEP_ID,
    data: {
      nodeType: 'trigger',
      triggerType: trigger.type,
      name: isDefined(trigger.name) ? trigger.name : triggerDefaultLabel,
      icon: triggerIcon,
      stepId: 'trigger',
      hasNextStepIds:
        isDefined(trigger.nextStepIds) && trigger.nextStepIds.length > 0,
      position: trigger.position ?? {
        x: 0,
        y: 0,
      },
    } satisfies WorkflowDiagramStepNodeData,
    position: trigger.position ?? {
      x: 0,
      y: 0,
    },
  };
};
