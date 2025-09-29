import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const isGlobalManualTrigger = (
  trigger: WorkflowTrigger,
  isIteratorEnabled: boolean,
) => {
  if (trigger.type !== 'MANUAL') {
    return false;
  }

  if (isIteratorEnabled && isDefined(trigger.settings?.availability)) {
    return trigger.settings.availability.type === 'GLOBAL';
  }

  return !isDefined(trigger.settings.objectType);
};
