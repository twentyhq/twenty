import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type AgentTrigger } from 'twenty-shared/application';
import { SidePanelPages } from 'twenty-shared/types';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CoreAgentTriggerTypeIcon } from '@/object-core/agents/components/CoreAgentTriggerTypeIcon';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useOpenCoreAgentSidePanelPage } from '@/object-core/agents/hooks/useOpenCoreAgentSidePanelPage';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { buildDefaultCoreAgentTrigger } from '@/object-core/agents/utils/buildDefaultCoreAgentTrigger';
import { getCoreAgentDefaultTriggerObjectNameSingular } from '@/object-core/agents/utils/getCoreAgentDefaultTriggerObjectNameSingular';
import { getCoreAgentTriggerTypeInfo } from '@/object-core/agents/utils/getCoreAgentTriggerTypeInfo';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
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

    const { label, icon } = getCoreAgentTriggerTypeInfo(trigger);

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
            <ListItemButton
              key={triggerType.defaultLabel}
              startIcon={
                <ListItemIconContainer>
                  <CoreAgentTriggerTypeIcon trigger={trigger} />
                </ListItemIconContainer>
              }
              onClick={() => addTrigger(trigger)}
            >
              {getCoreAgentTriggerTypeInfo(trigger).label}
            </ListItemButton>
          );
        })}
      </CommandMenuItemSectionGroup>
      <CommandMenuItemSectionGroup heading={t`Others`}>
        <ListItemButton
          startIcon={
            <ListItemIconContainer>
              <CoreAgentTriggerTypeIcon trigger={cronTrigger} />
            </ListItemIconContainer>
          }
          onClick={() => addTrigger(cronTrigger)}
        >
          {getCoreAgentTriggerTypeInfo(cronTrigger).label}
        </ListItemButton>
      </CommandMenuItemSectionGroup>
    </StyledList>
  );
};
