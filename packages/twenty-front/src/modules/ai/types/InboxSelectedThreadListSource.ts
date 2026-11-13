import { type InboxThreadListSource } from '@/ai/types/InboxThreadListSource';

export type InboxSelectedThreadListSource = Exclude<
  InboxThreadListSource,
  { type: 'recent' }
>;
