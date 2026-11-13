import { type InboxThreadSnoozeOption } from '@/ai/utils/getAgentChatThreadSnoozeOptions';

export type InboxSnoozePreset = InboxThreadSnoozeOption & {
  description?: string;
};
