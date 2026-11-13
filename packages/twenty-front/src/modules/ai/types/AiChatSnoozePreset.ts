import { type AiChatThreadSnoozeOption } from '@/ai/utils/getAiChatThreadSnoozeOptions';

export type AiChatSnoozePreset = AiChatThreadSnoozeOption & {
  description?: string;
};
