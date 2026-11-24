import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { useGetCoreAgentTriggerDescription } from '@/object-core/agents/hooks/useGetCoreAgentTriggerDescription';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentTriggerTypeLabelAndIcon } from '@/object-core/agents/utils/getCoreAgentTriggerTypeLabelAndIcon';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';

export const useCoreAgentTestHint = (agent: Pick<CoreAgent, 'triggers'>) => {
  const { t } = useLingui();
  const { getCoreAgentTriggerDescription } =
    useGetCoreAgentTriggerDescription();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const trigger = parseCoreAgentTriggers(agent.triggers).find(
    ({ isActive }) => isActive,
  );

  if (!isDefined(trigger)) {
    return undefined;
  }

  const { label } = getCoreAgentTriggerTypeLabelAndIcon(trigger);
  const details = getCoreAgentTriggerDescription(trigger);

  if (trigger.type === 'CRON') {
    return {
      placeholder: t`Do your scheduled task now`,
      description: t`This agent normally runs ${details}, without a message. Ask it to do its scheduled task now.`,
    };
  }

  const { objectType } = splitWorkflowTriggerEventName(
    trigger.settings.eventName,
  );
  const objectLabel =
    objectMetadataItems
      .find(({ nameSingular }) => nameSingular === objectType)
      ?.labelSingular.toLocaleLowerCase() ?? objectType;

  return {
    placeholder: t`Describe a ${objectLabel} and what changed on it`,
    description: t`This agent normally starts on “${label}” for ${details}, with that record. Describe one to see how it handles it.`,
  };
};
