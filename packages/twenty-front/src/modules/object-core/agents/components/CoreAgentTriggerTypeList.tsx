import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type AgentTrigger } from 'twenty-shared/application';
import { SidePanelPages } from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CoreAgentTriggerTypeItem } from '@/object-core/agents/components/CoreAgentTriggerTypeItem';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useOpenCoreAgentSidePanelPage } from '@/object-core/agents/hooks/useOpenCoreAgentSidePanelPage';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { buildDefaultCoreAgentTrigger } from '@/object-core/agents/utils/buildDefaultCoreAgentTrigger';
import { getCoreAgentDefaultTriggerObjectNameSingular } from '@/object-core/agents/utils/getCoreAgentDefaultTriggerObjectNameSingular';
import { getCoreAgentTriggerTypeLabelAndIcon } from '@/object-core/agents/utils/getCoreAgentTriggerTypeLabelAndIcon';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

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

  return (
    <StyledList>
      <CommandMenuItemSectionGroup heading={t`Data`}>
        {DATABASE_TRIGGER_TYPES.map((triggerType) => {
          const trigger = buildDefaultCoreAgentTrigger({
            type: 'DATABASE_EVENT',
            eventName: `${defaultObjectNameSingular}.${triggerType.event}`,
          });

          return (
            <CoreAgentTriggerTypeItem
              key={triggerType.defaultLabel}
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
    </StyledList>
  );
};
