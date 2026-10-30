import { t } from '@lingui/core/macro';
import { type AgentTrigger } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { CRON_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/CronTrigger';

export const getCoreAgentTriggerTypeInfo = (
  trigger: AgentTrigger,
): { label: string; icon: string } => {
  if (trigger.type === 'CRON') {
    return {
      label: getWorkflowStepDisplayName({
        name: CRON_TRIGGER.defaultLabel,
        type: CRON_TRIGGER.type,
      }),
      icon: CRON_TRIGGER.icon,
    };
  }

  const { event } = splitWorkflowTriggerEventName(trigger.settings.eventName);
  const databaseTriggerType = DATABASE_TRIGGER_TYPES.find(
    (triggerType) => triggerType.event === event,
  );

  if (!isDefined(databaseTriggerType)) {
    return { label: t`Record changes`, icon: 'IconAddressBook' };
  }

  return {
    label: getWorkflowStepDisplayName({
      name: databaseTriggerType.defaultLabel,
      type: databaseTriggerType.type,
    }),
    icon: databaseTriggerType.icon,
  };
};
