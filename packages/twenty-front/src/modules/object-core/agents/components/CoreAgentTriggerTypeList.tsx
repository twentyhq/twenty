import { useLingui } from '@lingui/react/macro';
import { type AgentTrigger } from 'twenty-shared/application';
import { SidePanelPages } from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/icon';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CORE_AGENT_ADDITIONAL_RECORD_TRIGGER_EVENTS } from '@/object-core/agents/constants/CoreAgentAdditionalRecordTriggerEvents';
import { CoreAgentTriggerTypeItem } from '@/object-core/agents/components/CoreAgentTriggerTypeItem';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useOpenCoreAgentSidePanelPage } from '@/object-core/agents/hooks/useOpenCoreAgentSidePanelPage';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { buildDefaultCoreAgentTrigger } from '@/object-core/agents/utils/buildDefaultCoreAgentTrigger';
import { getCoreAgentDefaultTriggerObjectNameSingular } from '@/object-core/agents/utils/getCoreAgentDefaultTriggerObjectNameSingular';
import { getCoreAgentTriggerTypeLabelAndIcon } from '@/object-core/agents/utils/getCoreAgentTriggerTypeLabelAndIcon';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';
import { SidePanelStepListContainer } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepContainer';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';

type CoreAgentTriggerTypeListProps = {
  agent: CoreAgent;
};

export const CoreAgentTriggerTypeList = ({
  agent,
}: CoreAgentTriggerTypeListProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { draft, updateDraft } = useCoreAgentDraft(agent);
  const { openCoreAgentSidePanelPage } = useOpenCoreAgentSidePanelPage();
  const objectOptions = useObjectMetadataItemSelectOptions();

  const defaultObjectNameSingular =
    getCoreAgentDefaultTriggerObjectNameSingular({
      triggers: parseCoreAgentTriggers(draft.triggers),
      objectNameSingulars: objectOptions.map(({ value }) => value),
    });

  const addTrigger = (trigger: AgentTrigger) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      triggers: [...currentDraft.triggers, trigger],
    }));

    const { label, icon } = getCoreAgentTriggerTypeLabelAndIcon(trigger);

    openCoreAgentSidePanelPage({
      agentId: agent.id,
      triggerId: trigger.id,
      page: SidePanelPages.AgentCoreTrigger,
      pageTitle: label,
      pageIcon: getIcon(icon),
    });
  };

  const cronTrigger = buildDefaultCoreAgentTrigger({ type: 'CRON' });
  const recordTriggerEvents = [
    ...DATABASE_TRIGGER_TYPES.map(({ event }) => event),
    ...CORE_AGENT_ADDITIONAL_RECORD_TRIGGER_EVENTS.map(({ event }) => event),
  ];

  return (
    <SidePanelStepListContainer>
      <CommandMenuItemSectionGroup heading={t`Data`}>
        {recordTriggerEvents.map((event) => {
          const trigger = buildDefaultCoreAgentTrigger({
            type: 'DATABASE_EVENT',
            eventName: `${defaultObjectNameSingular}.${event}`,
          });

          return (
            <CoreAgentTriggerTypeItem
              key={event}
              trigger={trigger}
              onClick={() => addTrigger(trigger)}
            />
          );
        })}
      </CommandMenuItemSectionGroup>
      <CommandMenuItemSectionGroup heading={t`Others`}>
        <CoreAgentTriggerTypeItem
          trigger={cronTrigger}
          onClick={() => addTrigger(cronTrigger)}
        />
      </CommandMenuItemSectionGroup>
    </SidePanelStepListContainer>
  );
};
