import { type AiChatThreadSnoozeOption } from '@/ai-chat/threads/utils/getAiChatThreadSnoozeOptions';

export type AiChatSnoozePreset = AiChatThreadSnoozeOption & {
  description?: string;
};
