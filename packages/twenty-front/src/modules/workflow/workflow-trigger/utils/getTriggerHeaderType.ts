import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import { assertUnreachable } from 'twenty-shared/utils';

export const getTriggerHeaderType = (trigger: WorkflowTrigger) => {
  switch (trigger.type) {
    case 'CRON': {
      return 'Trigger · Cron';
    }
    case 'WEBHOOK': {
      return 'Trigger · Webhook';
    }
    case 'MANUAL': {
      return 'Trigger · Manual';
    }
    case 'DATABASE_EVENT': {
      const defaultLabel = getTriggerDefaultLabel(trigger);

      return `Trigger · ${defaultLabel}`;
    }
    default: {
      assertUnreachable(trigger, 'Unknown trigger type');
    }
  }
};
