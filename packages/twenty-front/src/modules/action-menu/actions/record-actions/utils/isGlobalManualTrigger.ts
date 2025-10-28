import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const isGlobalManualTrigger = (trigger: WorkflowTrigger) => {
  if (trigger.type !== 'MANUAL') {
    return false;
  }

  // Legacy support for manual triggers without availability
  if (!isDefined(trigger.settings?.availability)) {
    return !isDefined(trigger.settings?.objectType);
  }

  return trigger.settings.availability.type === 'GLOBAL';
};
