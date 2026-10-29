import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatInboxFilterDropdown } from '@/ai/components/AiChatInboxFilterDropdown';
import { AGENT_CHAT_CHANNEL_OPEN_VIEW_ITEMS } from '@/ai/constants/AgentChatChannelOpenViewItems';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { findAgentChatChannelOpenViewItem } from '@/ai/utils/findAgentChatChannelOpenViewItem';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
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
  const setAgentChatChannelView = useSetAtomState(agentChatChannelViewState);
  const channelSummary = useAtomStateValue(agentChatChannelSummariesState)[
    channelView.channelId
  ];
  const { resetRecordSelection } = useResetRecordSelection();
  const selectedOpenViewItem = findAgentChatChannelOpenViewItem(channelView);

  const handleSelect = ({
    assignment,
    filter,
  }: Pick<AgentChatChannelView, 'assignment' | 'filter'>) => {
    resetRecordSelection();
    setAgentChatChannelView({
      ...channelView,
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
        count: isDefined(openViewItem.countKey)
          ? channelSummary?.[openViewItem.countKey]
          : undefined,
        isSelected: openViewItem === selectedOpenViewItem,
        onSelect: () => handleSelect(openViewItem),
      }))}
    />
  );
};
