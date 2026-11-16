import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type AiChatUsageMetadata } from 'twenty-shared/ai';

export type AiChatLastMessageUsage = Omit<
  AiChatUsageMetadata,
  'conversationSize'
>;

export type AiChatUsageState = {
  lastMessage: AiChatLastMessageUsage | null;
  cachedInputTokens: number;
  conversationSize: number;
  contextWindowTokens: number;
  inputTokens: number;
  outputTokens: number;
  inputCredits: number;
  outputCredits: number;
};

export const aiChatUsageFamilyState = createAtomFamilyState<
  AiChatUsageState | null,
  { threadId: string | null }
>({
  key: 'aiChatUsageFamilyState',
  defaultValue: null,
});
