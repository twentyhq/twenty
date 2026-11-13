import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/ai/constants/AgentChatThreadPresetFilterLabels';
import { type InboxChannelView } from '@/ai/types/AgentChatChannelView';
import { findInboxChannelOpenViewItem } from '@/ai/utils/findAgentChatChannelOpenViewItem';
import { getInboxChannelNavigationItemOrThrow } from '@/ai/utils/getAgentChatChannelNavigationItemOrThrow';

export const getInboxChannelViewLabel = (
  channelView: Pick<
    InboxChannelView,
    'channelStatus' | 'assignment' | 'filter'
  >,
) => {
  const openViewItem = findInboxChannelOpenViewItem(channelView);

  if (isDefined(openViewItem)) {
    return t(INBOX_THREAD_PRESET_FILTER_LABELS[openViewItem.presetFilter]);
  }

  return t(getInboxChannelNavigationItemOrThrow(channelView).label);
};
