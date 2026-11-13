import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';

export type AgentChatSelectedThreadListSource = Exclude<
  AgentChatThreadListSource,
  { type: 'recent' }
>;
