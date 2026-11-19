import { type InboxThreadListSource } from '@/inbox/types/InboxThreadListSource';

export type InboxSelectedThreadListSource = Exclude<
  InboxThreadListSource,
  { type: 'recent' }
>;
