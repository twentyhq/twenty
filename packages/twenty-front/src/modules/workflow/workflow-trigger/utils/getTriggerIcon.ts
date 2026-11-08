import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { getTriggerTypeIcon } from '@/workflow/workflow-trigger/utils/getTriggerTypeIcon';
import { isNonEmptyString } from '@sniptt/guards';

export const getTriggerIcon = (
  trigger: WorkflowTrigger,
): string | undefined => {
  if (trigger.type === 'MANUAL' && isNonEmptyString(trigger.settings.icon)) {
    return trigger.settings.icon;
  }

  return getTriggerTypeIcon({
    type: trigger.type,
    databaseEvent:
      trigger.type === 'DATABASE_EVENT'
        ? splitWorkflowTriggerEventName(trigger.settings.eventName).event
        : undefined,
  });
};
