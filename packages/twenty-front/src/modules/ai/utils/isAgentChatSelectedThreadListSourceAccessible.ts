import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';
import { type AgentChatSelectedThreadListSource } from '@/ai/types/AgentChatSelectedThreadListSource';

export const isAgentChatSelectedThreadListSourceAccessible = ({
  source,
  channels,
}: {
  source: AgentChatSelectedThreadListSource;
  channels: Pick<AgentChatChannel, 'id' | 'isAccessible'>[];
}) =>
  source.type !== 'channel' ||
  channels.some(
    ({ id, isAccessible }) =>
      isAccessible && id === source.channelView.channelId,
  );
