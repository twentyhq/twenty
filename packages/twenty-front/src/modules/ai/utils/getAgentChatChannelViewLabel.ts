import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { findAgentChatChannelOpenViewItem } from '@/ai/utils/findAgentChatChannelOpenViewItem';
import { getAgentChatChannelNavigationItemOrThrow } from '@/ai/utils/getAgentChatChannelNavigationItemOrThrow';

export const getAgentChatChannelViewLabel = (
  channelView: Pick<
    AgentChatChannelView,
    'channelStatus' | 'assignment' | 'filter'
  >,
) => {
  const openViewItem = findAgentChatChannelOpenViewItem(channelView);

  if (isDefined(openViewItem)) {
    return t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[openViewItem.filterStatus]);
  }

  return t(getAgentChatChannelNavigationItemOrThrow(channelView).label);
};
