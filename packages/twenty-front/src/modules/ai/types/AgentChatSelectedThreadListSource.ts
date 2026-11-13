import { type InboxThreadListSource } from '@/ai/types/AgentChatThreadListSource';

export type InboxSelectedThreadListSource = Exclude<
  InboxThreadListSource,
  { type: 'recent' }
>;
