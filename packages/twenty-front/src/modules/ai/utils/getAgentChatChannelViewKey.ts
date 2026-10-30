import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';

export const getAgentChatChannelViewKey = ({
  channelId,
  channelStatus,
  assignment,
  filter,
}: AgentChatChannelView) =>
  `${channelId}:${channelStatus}:${assignment}:${filter}`;
