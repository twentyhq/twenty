import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components/layout';
import { IconBolt, IconPlus, useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { CoreAgentList } from '@/object-core/agents/components/CoreAgentList';
import { CoreAgentSectionBody } from '@/object-core/agents/components/CoreAgentSectionBody';
import { CoreAgentTriggerTypeIcon } from '@/object-core/agents/components/CoreAgentTriggerTypeIcon';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useGetCoreAgentTriggerDescription } from '@/object-core/agents/hooks/useGetCoreAgentTriggerDescription';
import { useOpenCoreAgentSidePanelPage } from '@/object-core/agents/hooks/useOpenCoreAgentSidePanelPage';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentListItem } from '@/object-core/agents/types/CoreAgentListItem';
import { getCoreAgentTriggerTypeInfo } from '@/object-core/agents/utils/getCoreAgentTriggerTypeInfo';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { removeCoreAgentTrigger } from '@/object-core/agents/utils/removeCoreAgentTrigger';

type CoreAgentTriggersSectionProps = {
  agent: CoreAgent;
  isReadOnly: boolean;
};

export const CoreAgentTriggersSection = ({
  agent,
  isReadOnly,
}: CoreAgentTriggersSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { openCoreAgentSidePanelPage } = useOpenCoreAgentSidePanelPage();
  const { draft, updateDraft } = useCoreAgentDraft(agent);
  const { getCoreAgentTriggerDescription } =
    useGetCoreAgentTriggerDescription();

  const items: CoreAgentListItem[] = parseCoreAgentTriggers(draft.triggers).map(
    (trigger) => {
      const { label, icon } = getCoreAgentTriggerTypeInfo(trigger);

      return {
        id: trigger.id,
        label,
        description: getCoreAgentTriggerDescription(trigger),
        icon: <CoreAgentTriggerTypeIcon trigger={trigger} />,
        edit: isReadOnly
          ? undefined
          : {
              label: t`Edit trigger`,
              onClick: () =>
                openCoreAgentSidePanelPage({
                  agentId: agent.id,
                  triggerId: trigger.id,
                  page: SidePanelPages.AgentCoreTrigger,
                  pageTitle: label,
                  pageIcon: getIcon(icon),
                }),
            },
        remove: isReadOnly
          ? undefined
          : {
              label: t`Remove trigger`,
              onClick: () =>
                updateDraft((currentDraft) => ({
                  ...currentDraft,
                  triggers: removeCoreAgentTrigger({
                    triggers: currentDraft.triggers,
                    triggerId: trigger.id,
                  }),
                })),
            },
      };
    },
  );

  return (
    <Section.Root>
      <Section.Header
        title={t`Trigger`}
        description={t`When should this agent run on its own`}
      />
      <CoreAgentSectionBody>
        <CoreAgentList
          items={items}
          emptyMessage={t`This agent only runs when someone sends it a message.`}
        />
        {!isReadOnly && (
          <Button
            variant="outline"
            startIcon={<IconPlus />}
            onClick={() =>
              openCoreAgentSidePanelPage({
                agentId: agent.id,
                page: SidePanelPages.AgentCoreTriggerType,
                pageTitle: t`Add trigger`,
                pageIcon: IconBolt,
              })
            }
          >{t`Add trigger`}</Button>
        )}
      </CoreAgentSectionBody>
    </Section.Root>
  );
};
