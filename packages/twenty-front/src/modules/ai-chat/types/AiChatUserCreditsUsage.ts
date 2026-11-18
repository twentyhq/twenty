import { type AiChatUsage } from '@/ai-chat/types/AiChatUsage';

export type AiChatUserCreditsUsage = Pick<
  AiChatUsage,
  'limitValue' | 'consumedValue'
> & {
  periodEnd: string;
};
