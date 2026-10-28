import { t } from '@lingui/core/macro';

import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { getAgentChatChannelNavigationItemOrThrow } from '@/ai/utils/getAgentChatChannelNavigationItemOrThrow';
import { AgentChatChannelAssignmentFilter } from '~/generated-metadata/graphql';

export const getAgentChatChannelViewLabel = (
  channelView: Pick<AgentChatChannelView, 'channelStatus' | 'assignment'>,
) => {
  const navigationItem = getAgentChatChannelNavigationItemOrThrow(channelView);
  const channelStatusLabel = t(navigationItem.label);

  if (channelView.assignment === navigationItem.assignment) {
    return channelStatusLabel;
  }

  const assignmentLabel =
    channelView.assignment === AgentChatChannelAssignmentFilter.UNASSIGNED
      ? t`Unassigned`
      : t`Mine`;

  return t`${channelStatusLabel} · ${assignmentLabel}`;
};
