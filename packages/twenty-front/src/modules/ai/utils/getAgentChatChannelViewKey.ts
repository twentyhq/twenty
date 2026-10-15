import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';

export const getAgentChatChannelViewKey = ({
  channelId,
  channelStatus,
  assignment,
}: AgentChatChannelView) => `${channelId}:${channelStatus}:${assignment}`;
