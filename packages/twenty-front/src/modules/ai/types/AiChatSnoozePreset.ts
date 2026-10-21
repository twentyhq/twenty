import { type AgentChatThreadSnoozeOption } from '@/ai/utils/getAgentChatThreadSnoozeOptions';

export type AiChatSnoozePreset = AgentChatThreadSnoozeOption & {
  description?: string;
};
