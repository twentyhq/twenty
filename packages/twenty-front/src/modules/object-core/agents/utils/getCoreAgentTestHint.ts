import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { getCoreAgentTriggerTypeLabelAndIcon } from '@/object-core/agents/utils/getCoreAgentTriggerTypeLabelAndIcon';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { type AgentTrigger } from 'twenty-shared/application';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';

export type CoreAgentTestHint = {
  placeholder: string;
  description: string;
};

export const getCoreAgentTestHint = ({
  triggers,
  getTriggerDetails,
  getObjectLabelSingular,
}: {
  triggers: unknown[];
  getTriggerDetails: (trigger: AgentTrigger) => string;
  getObjectLabelSingular: (objectNameSingular: string) => string | undefined;
}): CoreAgentTestHint | undefined => {
  const trigger = parseCoreAgentTriggers(triggers).find(
    ({ isActive }) => isActive,
  );

  if (!isDefined(trigger)) {
    return undefined;
  }

  const details = getTriggerDetails(trigger);

  if (trigger.type === 'CRON') {
    return {
      placeholder: t`Do your scheduled task now`,
      description: t`This agent normally runs ${details}, without a message. Ask it to do its scheduled task now.`,
    };
  }

  const { label } = getCoreAgentTriggerTypeLabelAndIcon(trigger);
  const { objectType } = splitWorkflowTriggerEventName(
    trigger.settings.eventName,
  );
  const objectLabel =
    getObjectLabelSingular(objectType)?.toLocaleLowerCase() ?? objectType;

  return {
    placeholder: t`Describe a ${objectLabel} and what changed on it`,
    description: t`This agent normally starts on “${label}” for ${details}, with that record. Describe one to see how it handles it.`,
  };
};
