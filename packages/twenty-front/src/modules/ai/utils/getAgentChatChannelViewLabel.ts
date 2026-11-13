import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_PRESET_FILTER_LABELS } from '@/ai/constants/AgentChatThreadPresetFilterLabels';
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
    return t(AGENT_CHAT_THREAD_PRESET_FILTER_LABELS[openViewItem.presetFilter]);
  }

  return t(getAgentChatChannelNavigationItemOrThrow(channelView).label);
};
