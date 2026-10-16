import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';
import { isDefined } from 'twenty-shared/utils';

export const getTriggerDefaultLabel = (trigger: WorkflowTrigger): string => {
  if (trigger.type === 'DATABASE_EVENT') {
    const triggerEvent = splitWorkflowTriggerEventName(
      trigger.settings.eventName,
    );

    const label = DATABASE_TRIGGER_TYPES.find(
      (type) => type.event === triggerEvent.event,
    )?.defaultLabel;

    if (!isDefined(label)) {
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      throw new Error('Unknown trigger event');
    }

    return label;
  }

  const label = OTHER_TRIGGER_TYPES.find(
    (item) => item.type === trigger.type,
  )?.defaultLabel;

  if (!isDefined(label)) {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
    throw new Error('Unknown trigger type');
  }

  return label;
};
