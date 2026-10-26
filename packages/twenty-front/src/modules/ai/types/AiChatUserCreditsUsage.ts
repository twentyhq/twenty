import { type AiChatUsage } from '@/ai/types/AiChatUsage';

export type AiChatUserCreditsUsage = Pick<
  AiChatUsage,
  'limitValue' | 'consumedValue'
> & {
  periodEnd: string;
};
