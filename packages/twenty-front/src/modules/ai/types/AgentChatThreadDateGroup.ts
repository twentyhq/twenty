import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type InboxThreadDateGroup = {
  id: string;
  title: string;
  threads: InboxThreadRecord[];
};
