import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

export const getAgentChatChannelThreadSortAt = ({
  thread,
  channelStatus,
}: {
  thread: AgentChatThreadRecord;
  channelStatus: AgentChatChannelView['channelStatus'];
}): string | null =>
  channelStatus === AgentChatChannelThreadStatus.SNOOZED
    ? (thread.channelSnoozedUntil ?? null)
    : getAgentChatThreadLastActivityAt(thread);
