import { type AiChatUsage } from '@/ai-chat/usage/types/AiChatUsage';

export type AiChatUserCreditsUsage = Pick<
  AiChatUsage,
  'limitValue' | 'consumedValue'
> & {
  periodEnd: string;
};
