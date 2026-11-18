import { type AiChatThreadSnoozeOption } from '@/ai-chat/utils/getAiChatThreadSnoozeOptions';

export type AiChatSnoozePreset = AiChatThreadSnoozeOption & {
  description?: string;
};
