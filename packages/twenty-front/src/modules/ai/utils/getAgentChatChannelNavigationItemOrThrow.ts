import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS } from '@/ai/constants/AgentChatChannelNavigationItems';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { AgentChatChannelAssignmentFilter } from '~/generated-metadata/graphql';

export const getAgentChatChannelNavigationItemOrThrow = (
  channelView: Pick<AgentChatChannelView, 'channelStatus' | 'assignment'>,
) => {
  const matchingView = AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.find(
    ({ channelStatus, assignment }) =>
      channelStatus === channelView.channelStatus &&
      assignment === channelView.assignment,
  );

  if (isDefined(matchingView)) {
    return matchingView;
  }

  const matchingStatus = AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.find(
    ({ channelStatus, assignment }) =>
      channelStatus === channelView.channelStatus &&
      assignment === AgentChatChannelAssignmentFilter.ANY,
  );

  assertIsDefinedOrThrow(matchingStatus);

  return matchingStatus;
};
