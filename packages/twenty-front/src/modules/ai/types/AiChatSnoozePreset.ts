import { type AiChatThreadSnoozeOption } from '@/ai/utils/getAgentChatThreadSnoozeOptions';

export type AiChatSnoozePreset = AiChatThreadSnoozeOption & {
  description?: string;
};
