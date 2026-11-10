import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { type CoreWorkflowTriggerDisplay } from '@/object-core/workflows/types/CoreWorkflowTriggerDisplay';
import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';

export const getCoreWorkflowTriggerDisplay = (
  trigger: CoreWorkflow['trigger'],
): CoreWorkflowTriggerDisplay | undefined => {
  if (!isDefined(trigger)) {
    return undefined;
  }

  if (trigger.type === 'DATABASE_EVENT') {
    if (!isNonEmptyString(trigger.databaseEventName)) {
      return undefined;
    }

    const { objectType, event } = splitWorkflowTriggerEventName(
      trigger.databaseEventName,
    );

    const databaseTriggerType = DATABASE_TRIGGER_TYPES.find(
      (databaseTrigger) => databaseTrigger.event === event,
    );

    if (!isDefined(databaseTriggerType)) {
      return undefined;
    }

    return {
      label: getWorkflowStepDisplayName({
        name: databaseTriggerType.defaultLabel,
        type: databaseTriggerType.type,
      }),
      iconName: databaseTriggerType.icon,
      objectNameSingular: objectType,
    };
  }

  const otherTriggerType = OTHER_TRIGGER_TYPES.find(
    (otherTrigger) => otherTrigger.type === trigger.type,
  );

  if (!isDefined(otherTriggerType)) {
    return undefined;
  }

  return {
    label: getWorkflowStepDisplayName({
      name: otherTriggerType.defaultLabel,
      type: otherTriggerType.type,
    }),
    iconName: otherTriggerType.icon,
  };
};
