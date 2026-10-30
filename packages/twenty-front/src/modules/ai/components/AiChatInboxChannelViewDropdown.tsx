import { useLingui } from '@lingui/react/macro';

import { AiChatInboxFilterDropdown } from '@/ai/components/AiChatInboxFilterDropdown';
import { AGENT_CHAT_CHANNEL_OPEN_VIEW_ITEMS } from '@/ai/constants/AgentChatChannelOpenViewItems';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { findAgentChatChannelOpenViewItem } from '@/ai/utils/findAgentChatChannelOpenViewItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

type AiChatInboxChannelViewDropdownProps = {
  channelView: AgentChatChannelView;
};

export const AiChatInboxChannelViewDropdown = ({
  channelView,
}: AiChatInboxChannelViewDropdownProps) => {
  const { t } = useLingui();
  const { openAgentChatChannel } = useOpenAgentChatChannel();
  const channelSummary = useAtomStateValue(agentChatChannelSummariesState)[
    channelView.channelId
  ];
  const selectedOpenViewItem = findAgentChatChannelOpenViewItem(channelView);

  const handleSelect = ({
    assignment,
    filter,
  }: Pick<AgentChatChannelView, 'assignment' | 'filter'>) => {
    openAgentChatChannel({
      channelId: channelView.channelId,
      channelStatus: AgentChatChannelThreadStatus.OPEN,
      assignment,
      filter,
    });
  };

  return (
    <AiChatInboxFilterDropdown
      isFiltered={
        channelView.assignment !== AgentChatChannelAssignmentFilter.ANY ||
        channelView.filter !== AgentChatChannelThreadFilter.ANY
      }
      options={AGENT_CHAT_CHANNEL_OPEN_VIEW_ITEMS.map((openViewItem) => ({
        key: openViewItem.filterStatus,
        label: t(
          AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[openViewItem.filterStatus],
        ),
        Icon: AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[openViewItem.filterStatus],
        count: channelSummary?.[openViewItem.countKey],
        isSelected: openViewItem === selectedOpenViewItem,
        onSelect: () => handleSelect(openViewItem),
      }))}
    />
  );
};
