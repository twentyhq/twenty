import { type InboxThreadSnoozeOption } from '@/ai/utils/getInboxThreadSnoozeOptions';

export type InboxSnoozePreset = InboxThreadSnoozeOption & {
  description?: string;
};
