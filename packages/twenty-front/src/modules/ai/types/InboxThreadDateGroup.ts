import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

export type InboxThreadDateGroup = {
  id: string;
  title: string;
  threads: InboxThreadRecord[];
};
