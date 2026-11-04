import { AgentChatChannelThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-thread-status.enum';

// Over aliases "thread" and "participant"; must match the client's inbox status logic
const isActiveAfter = (column: string) =>
  `COALESCE(thread."lastActivityAt" > ${column}, false)`;

const IS_OPEN = `(thread."channelArchivedAt" IS NULL OR ${isActiveAfter('thread."channelArchivedAt"')})`;

export const AGENT_CHAT_CHANNEL_THREAD_PREDICATES = {
  IS_UNREAD: `(thread."lastActivityAt" IS NOT NULL AND (participant."lastReadAt" IS NULL OR thread."lastActivityAt" > participant."lastReadAt"))`,
  STATUS: {
    [AgentChatChannelThreadStatus.OPEN]: IS_OPEN,
    [AgentChatChannelThreadStatus.SNOOZED]: `(thread."channelArchivedAt" IS NOT NULL AND thread."channelSnoozedUntil" IS NOT NULL AND NOT ${isActiveAfter('thread."channelArchivedAt"')})`,
    [AgentChatChannelThreadStatus.DONE]: `(thread."channelArchivedAt" IS NOT NULL AND thread."channelSnoozedUntil" IS NULL AND NOT ${isActiveAfter('thread."channelArchivedAt"')})`,
  } satisfies Record<AgentChatChannelThreadStatus, string>,
} as const;
