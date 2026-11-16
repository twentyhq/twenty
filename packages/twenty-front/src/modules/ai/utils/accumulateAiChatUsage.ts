import {
  type AiChatModelMetadata,
  type AiChatUsageMetadata,
} from 'twenty-shared/ai';

import { type AiChatUsageState } from '@/ai/states/aiChatUsageFamilyState';

export const accumulateAiChatUsage = (
  previousUsage: AiChatUsageState | null,
  messageUsage: AiChatUsageMetadata,
  model: AiChatModelMetadata,
): AiChatUsageState => ({
  lastMessage: {
    inputTokens: messageUsage.inputTokens,
    outputTokens: messageUsage.outputTokens,
    cachedInputTokens: messageUsage.cachedInputTokens,
    inputCredits: messageUsage.inputCredits,
    outputCredits: messageUsage.outputCredits,
  },
  cachedInputTokens:
    (previousUsage?.cachedInputTokens ?? 0) + messageUsage.cachedInputTokens,
  conversationSize: messageUsage.conversationSize,
  contextWindowTokens: model.contextWindowTokens,
  inputTokens: (previousUsage?.inputTokens ?? 0) + messageUsage.inputTokens,
  outputTokens: (previousUsage?.outputTokens ?? 0) + messageUsage.outputTokens,
  inputCredits: (previousUsage?.inputCredits ?? 0) + messageUsage.inputCredits,
  outputCredits:
    (previousUsage?.outputCredits ?? 0) + messageUsage.outputCredits,
});
