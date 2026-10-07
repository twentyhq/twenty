import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

import { AiChatInboxTriageCommandMenuItems } from '@/ai/components/AiChatInboxTriageCommandMenuItems';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { RecordIndexPageHeaderTitle } from '@/object-record/record-index/components/RecordIndexPageHeaderTitle';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatInboxListHeaderProps = {
  selectedThreadCount: number;
};

export const AiChatInboxListHeader = ({
  selectedThreadCount,
}: AiChatInboxListHeaderProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const channel = useAtomStateValue(agentChatChannelsState)?.find(
    ({ id }) => id === agentChatShownChannelView?.channelId,
  );
  const ChannelIcon = useAgentChatChannelIcon(channel?.icon);
  const HeaderIcon = isDefined(agentChatShownChannelView)
    ? ChannelIcon
    : AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus];
  const headerLabel = isDefined(agentChatShownChannelView)
    ? (channel?.name ?? '')
    : t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus]);
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });

  return (
    <PageCardHeader
      icon={<HeaderIcon size={theme.icon.size.md} />}
      title={
        <RecordIndexPageHeaderTitle
          label={headerLabel}
          numberOfSelectedRecords={selectedThreadCount}
        />
      }
      actionButton={
        selectedThreadCount > 0 ? (
          <>
            <CommandMenuContextProvider
              displayType="button"
              containerType={CommandMenuItemContainerType.IndexPageHeader}
            >
              <AiChatInboxTriageCommandMenuItems>
                <PinnedCommandMenuItemButtons />
              </AiChatInboxTriageCommandMenuItems>
            </CommandMenuContextProvider>
            <SidePanelToggleButton />
          </>
        ) : (
          <Button
            size="sm"
            variant="solid"
            color="accent"
            startIcon={<IconPlus />}
            onClick={() =>
              switchToNewChat({
                channelId: agentChatShownChannelView?.channelId ?? null,
              })
            }
          >
            {t`New chat`}
          </Button>
        )
      }
    />
  );
};
