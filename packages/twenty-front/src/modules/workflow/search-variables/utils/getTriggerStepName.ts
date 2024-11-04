import {
  WorkflowDatabaseEventTrigger,
  WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { capitalize } from '~/utils/string/capitalize';

export const getTriggerStepName = (trigger: WorkflowTrigger): string => {
  switch (trigger.type) {
    case 'DATABASE_EVENT':
      return getDatabaseEventTriggerStepName(trigger);
    case 'MANUAL':
      if (!trigger.settings.objectType) {
        return 'Manual trigger';
      }

      return 'Manual trigger for ' + capitalize(trigger.settings.objectType);
    default:
      return '';
  }
};

const getDatabaseEventTriggerStepName = (
  trigger: WorkflowDatabaseEventTrigger,
): string => {
  const [object, action] = trigger.settings.eventName.split('.');

  return `${capitalize(object)} is ${capitalize(action)}`;
};
