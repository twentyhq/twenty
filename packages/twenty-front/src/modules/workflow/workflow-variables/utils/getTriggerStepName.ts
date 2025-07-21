import { WorkflowTrigger } from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerLabel';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const getTriggerStepName = (trigger: WorkflowTrigger): string => {
  switch (trigger.type) {
    case 'DATABASE_EVENT':
    case 'CRON':
    case 'WEBHOOK':
      return getTriggerDefaultLabel(trigger);
    case 'MANUAL':
      if (!isDefined(trigger.settings.objectType)) {
        return getTriggerDefaultLabel(trigger);
      }

      return 'Manual trigger for ' + capitalize(trigger.settings.objectType);
  }

  return assertUnreachable(trigger);
};
