import {
  WorkflowDatabaseEventTrigger,
  WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerLabel';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const getTriggerStepName = (trigger: WorkflowTrigger): string => {
  switch (trigger.type) {
    case 'DATABASE_EVENT':
      return getDatabaseEventTriggerStepName(trigger);
    case 'CRON':
      return 'On a Schedule';
    case 'WEBHOOK':
      return 'Webhook';
    case 'MANUAL':
      if (!isDefined(trigger.settings.objectType)) {
        return 'Manual trigger';
      }

      return 'Manual trigger for ' + capitalize(trigger.settings.objectType);
  }

  return assertUnreachable(trigger);
};

const getDatabaseEventTriggerStepName = (
  trigger: WorkflowDatabaseEventTrigger,
): string => {
  const defaultLabel = getTriggerDefaultLabel(trigger);

  return defaultLabel ?? '';
};
