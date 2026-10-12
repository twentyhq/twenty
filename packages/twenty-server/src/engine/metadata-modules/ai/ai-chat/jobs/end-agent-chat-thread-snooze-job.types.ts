import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';

export type EndAgentChatThreadSnoozeJobData = AgentChatThreadAccessArgs & {
  snoozedUntil: string;
};
